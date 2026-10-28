const SiteVisit = require('../models/SiteVisit');
const User = require('../models/User');

// @desc    Get site visits based on user role
// @route   GET /api/site-visits
// @access  Protected
const getSiteVisits = async (req, res, next) => {
  try {
    const { status, limit = 100 } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'agent') {
      query.$or = [
        { assignedAgentId: req.user._id },
        { agent: req.user.name },
      ];
    }

    if (status && status !== 'all') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const visits = await SiteVisit.find(query)
      .populate('customerId', 'name email phone')
      .populate('projectId', 'projectName city locality')
      .populate('propertyId', 'title address price')
      .populate('assignedAgentId', 'name email phone')
      .sort({ scheduledAt: 1 })
      .limit(Number(limit));

    // Format for frontend
    const formatted = visits.map((v) => ({
      id: v._id,
      client: v.clientName,
      project: v.project || (v.propertyId ? v.propertyId.title : 'EstateHub Property'),
      agent: v.agent || (v.assignedAgentId ? v.assignedAgentId.name : 'Vikram Malhotra'),
      date: `${v.scheduledAt.toISOString().split('T')[0]} (${v.timeSlot})`,
      status: v.status,
      notes: v.notes,
      raw: v,
    }));

    return res.status(200).json({
      success: true,
      message: 'Site visits retrieved successfully.',
      data: {
        siteVisits: formatted,
        rawVisits: visits,
        total: formatted.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule / Request a site visit
// @route   POST /api/site-visits
// @access  Protected / Public with token
const createSiteVisit = async (req, res, next) => {
  try {
    const {
      name,
      clientName,
      phone,
      email,
      date,
      scheduledAt,
      timeSlot = 'Morning (10:00 AM - 1:00 PM)',
      project,
      projectId,
      propertyId,
      notes,
    } = req.body;

    const client = (clientName || name || (req.user && req.user.name) || '').trim();
    const contactPhone = (phone || (req.user && req.user.phone) || '').trim();

    if (!client || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Client name and phone number are required.',
      });
    }

    const targetDate = scheduledAt || date;
    if (!targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a visit date.',
      });
    }

    const parsedDate = new Date(targetDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format.',
      });
    }

    // Default assigned agent
    let agentName = 'Vikram Malhotra';
    let agentId = null;
    const defaultAgent = await User.findOne({ role: 'agent', status: 'active' });
    if (defaultAgent) {
      agentName = defaultAgent.name;
      agentId = defaultAgent._id;
    }

    const visit = await SiteVisit.create({
      customerId: req.user ? req.user._id : null,
      clientName: client,
      phone: contactPhone,
      email: email || (req.user ? req.user.email : ''),
      project: project || 'EstateHub Showcase',
      projectId: projectId || null,
      propertyId: propertyId || null,
      assignedAgentId: agentId,
      agent: agentName,
      scheduledAt: parsedDate,
      timeSlot,
      status: req.user && req.user.role === 'customer' ? 'Requested' : 'Confirmed',
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Site visit scheduled successfully! Our executive will meet you at the property.',
      data: { siteVisit: visit },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update site visit status or reschedule
// @route   PUT /api/site-visits/:id
// @access  Protected
const updateSiteVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visit = await SiteVisit.findById(id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Site visit not found.',
      });
    }

    // Role check: customer can only cancel their own visit
    if (req.user.role === 'customer') {
      if (visit.customerId && visit.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only modify your own site visits.',
        });
      }
      if (req.body.status && !['Cancelled', 'cancelled', 'Rescheduled', 'rescheduled'].includes(req.body.status)) {
        return res.status(403).json({
          success: false,
          message: 'Customers may only request rescheduling or cancellation.',
        });
      }
    }

    const { status, scheduledAt, date, timeSlot, notes, agent } = req.body;

    if (status) visit.status = status;
    if (timeSlot) visit.timeSlot = timeSlot;
    if (notes !== undefined) visit.notes = notes;
    if (agent && req.user.role === 'admin') visit.agent = agent;
    if (scheduledAt || date) {
      const newD = new Date(scheduledAt || date);
      if (!isNaN(newD.getTime())) visit.scheduledAt = newD;
    }

    await visit.save();

    return res.status(200).json({
      success: true,
      message: 'Site visit updated successfully.',
      data: { siteVisit: visit },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSiteVisits,
  createSiteVisit,
  updateSiteVisit,
};
