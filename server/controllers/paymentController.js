const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Get payments (Staff sees all/authorized; Customer sees own)
// @route   GET /api/payments
// @access  Protected
const getPayments = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('bookingId', 'bookingReference clientName project agreedPrice tokenAmount')
      .populate('customerId', 'name email')
      .populate('recordedBy', 'name role')
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      message: 'Payment records retrieved successfully.',
      data: {
        payments,
        total: payments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record manual payment
// @route   POST /api/payments
// @access  Protected (Agent / Admin)
const recordPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      amount,
      paymentType = 'token',
      paymentMethod = 'bank_transfer',
      referenceNumber,
      notes,
    } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and payment amount are required.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    const payment = await Payment.create({
      bookingId,
      customerId: booking.customerId,
      amount: Number(amount),
      paymentType,
      paymentMethod,
      referenceNumber: referenceNumber || `TXN-${Date.now().toString().slice(-6)}`,
      status: 'paid',
      recordedBy: req.user._id,
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  recordPayment,
};
