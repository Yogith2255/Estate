const Booking = require('../models/Booking');
const Unit = require('../models/Unit');
const Project = require('../models/Project');
const Lead = require('../models/Lead');
const LeadActivity = require('../models/LeadActivity');

// @desc    Get bookings
// @route   GET /api/bookings
// @access  Protected
const getBookings = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('projectId', 'projectName city locality')
      .populate('unitId', 'unitNumber floor area price')
      .populate('leadId', 'customerName phone status')
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
      id: b.bookingReference,
      bookingId: b._id,
      client: b.clientName,
      project: b.project || (b.projectId ? b.projectId.projectName : 'Unspecified Project'),
      unit: b.unit || (b.unitId ? b.unitId.unitNumber : 'N/A'),
      amount: b.tokenAmount || b.agreedPrice,
      agreedPrice: b.agreedPrice,
      status: b.status,
      bookingDate: b.bookingDate,
      raw: b,
    }));

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully.',
      data: {
        bookings: formatted,
        rawBookings: bookings,
        total: formatted.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking for unit or property with double-booking prevention
// @route   POST /api/bookings
// @access  Protected (Customer / Agent / Admin)
const createBooking = async (req, res, next) => {
  try {
    const {
      clientName,
      unitId,
      projectId,
      propertyId,
      leadId,
      agreedPrice,
      tokenAmount = 0,
      notes,
    } = req.body;

    const client = (clientName || req.user.name).trim();
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required for booking.',
      });
    }

    let resolvedProjectName = '';
    let resolvedUnitNumber = '';
    let finalAgreedPrice = Number(agreedPrice) || 0;

    // Double-booking check on Unit
    if (unitId) {
      // Atomic find and reserve unit to prevent concurrency race
      const reservedUnit = await Unit.findOneAndUpdate(
        {
          _id: unitId,
          status: { $in: ['available', 'Available'] },
        },
        {
          $set: { status: 'booked' },
        },
        { returnDocument: 'after' }
      );

      if (!reservedUnit) {
        return res.status(409).json({
          success: false,
          message: 'The selected unit is no longer available or has already been booked.',
        });
      }

      resolvedUnitNumber = reservedUnit.unitNumber;
      if (!finalAgreedPrice) finalAgreedPrice = reservedUnit.price;

      // Update project available units count
      if (reservedUnit.projectId) {
        const prj = await Project.findByIdAndUpdate(reservedUnit.projectId, {
          $inc: { availableUnits: -1 },
        });
        if (prj) resolvedProjectName = prj.projectName;
      }
    } else if (projectId) {
      const prj = await Project.findById(projectId);
      if (prj) {
        resolvedProjectName = prj.projectName;
        if (!finalAgreedPrice) finalAgreedPrice = prj.startingPrice;
      }
    }

    // Generate unique booking reference
    const bookingReference = `BK-${Date.now().toString().slice(-5)}`;

    const booking = await Booking.create({
      bookingReference,
      customerId: req.user.role === 'customer' ? req.user._id : (req.body.customerId || null),
      clientName: client,
      projectId: projectId || null,
      project: resolvedProjectName || req.body.project || 'EstateHub Premium Property',
      unitId: unitId || null,
      unit: resolvedUnitNumber || req.body.unit || 'A-101',
      propertyId: propertyId || null,
      leadId: leadId || null,
      agreedPrice: finalAgreedPrice,
      tokenAmount: Number(tokenAmount) || Math.round(finalAgreedPrice * 0.05),
      status: 'Booking',
      notes: notes || '',
    });

    // If associated with a Lead, update lead to Booking status
    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, { status: 'Booking' });
      await LeadActivity.create({
        leadId,
        actorId: req.user._id,
        activityType: 'status_change',
        description: `Booking reference ${bookingReference} generated with token ₹${booking.tokenAmount}`,
        newStatus: 'Booking',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Booking generated successfully.',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update / Cancel booking
// @route   PUT /api/bookings/:id
// @access  Protected (Agent / Admin)
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const prevStatus = booking.status;

    if (status) {
      booking.status = status;

      // If booking was cancelled, release the unit back to available
      if (
        (status === 'Cancelled' || status === 'cancelled') &&
        prevStatus !== 'Cancelled' &&
        booking.unitId
      ) {
        await Unit.findByIdAndUpdate(booking.unitId, { status: 'available' });
        if (booking.projectId) {
          await Project.findByIdAndUpdate(booking.projectId, { $inc: { availableUnits: 1 } });
        }
      }
    }

    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully.',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
};
