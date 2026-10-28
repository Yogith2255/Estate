const Lead = require('../models/Lead');
const LeadActivity = require('../models/LeadActivity');
const User = require('../models/User');

// @desc    Get leads based on role (Customer -> own; Agent -> assigned; Admin -> all)
// @route   GET /api/leads
// @access  Protected
const getLeads = async (req, res, next) => {
  try {
    const { status, agent, project, search, temperature, limit = 100, page = 1 } = req.query;

    const query = {};

    // Role-based visibility isolation
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'agent') {
      // Agents see leads assigned to their User ID or their name
      query.$or = [
        { assignedAgentId: req.user._id },
        { assignedAgent: req.user.name },
      ];
    } else if (req.user.role === 'admin') {
      if (agent && agent !== 'all') {
        query.$or = [
          { assignedAgent: agent },
          ...(agent.match(/^[0-9a-fA-F]{24}$/) ? [{ assignedAgentId: agent }] : []),
        ];
      }
    }

    if (status && status !== 'all') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    if (project && project !== 'all') {
      query.interestedProject = { $regex: new RegExp(project, 'i') };
    }

    if (temperature && temperature !== 'all') {
      query.temperature = { $regex: new RegExp(`^${temperature}$`, 'i') };
    }

    if (search) {
      const q = search.trim();
      const searchConditions = [
        { customerName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { interestedProject: { $regex: q, $options: 'i' } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const leads = await Lead.find(query)
      .populate('customerId', 'name email phone')
      .populate('assignedAgentId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully.',
      data: {
        leads,
        total: leads.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lead by ID with its activity log
// @route   GET /api/leads/:id
// @access  Protected
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id)
      .populate('customerId', 'name email phone')
      .populate('assignedAgentId', 'name email phone')
      .populate('projectId')
      .populate('interestedPropertyId');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead record not found.',
      });
    }

    // Role check
    if (req.user.role === 'customer' && lead.customerId && lead.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot access leads belonging to another user.',
      });
    }

    if (
      req.user.role === 'agent' &&
      lead.assignedAgentId &&
      lead.assignedAgentId.toString() !== req.user._id.toString() &&
      lead.assignedAgent !== req.user.name
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This lead is assigned to another agent.',
      });
    }

    const activities = await LeadActivity.find({ leadId: lead._id })
      .populate('actorId', 'name role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Lead details retrieved successfully.',
      data: {
        lead,
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an enquiry (creates a Lead)
// @route   POST /api/leads/enquiry
// @access  Public / Customer
const createEnquiry = async (req, res, next) => {
  try {
    const {
      name,
      customerName,
      email,
      phone,
      project,
      interestedProject,
      projectId,
      propertyId,
      budget,
      preferredLocation,
      preferredUnitType,
      message,
      notes,
      source = 'Website Enquiry',
    } = req.body;

    const leadName = (customerName || name || (req.user && req.user.name) || '').trim();
    const leadEmail = (email || (req.user && req.user.email) || '').trim().toLowerCase();
    const leadPhone = (phone || (req.user && req.user.phone) || '').trim();

    if (!leadName || !leadPhone) {
      return res.status(400).json({
        success: false,
        message: 'Full name and contact phone number are required.',
      });
    }

    // Assign to a default agent or first active agent
    let defaultAgentName = 'Vikram Malhotra';
    let defaultAgentId = null;
    const agentUser = await User.findOne({ role: 'agent', status: 'active' });
    if (agentUser) {
      defaultAgentName = agentUser.name;
      defaultAgentId = agentUser._id;
    }

    const lead = await Lead.create({
      customerId: req.user ? req.user._id : null,
      customerName: leadName,
      email: leadEmail,
      phone: leadPhone,
      interestedProject: interestedProject || project || 'EstateHub General Inquiry',
      projectId: projectId || null,
      interestedPropertyId: propertyId || null,
      assignedAgentId: defaultAgentId,
      assignedAgent: defaultAgentName,
      source,
      budget: Number(budget) || 0,
      preferredLocation: preferredLocation || '',
      preferredUnitType: preferredUnitType || '3 BHK',
      notes: notes || message || '',
      status: 'New',
      temperature: 'Warm',
    });

    // Create initial LeadActivity record
    await LeadActivity.create({
      leadId: lead._id,
      actorId: req.user ? req.user._id : null,
      activityType: 'note',
      description: `New enquiry received from ${leadName} for ${lead.interestedProject}. Note: ${lead.notes || 'None'}`,
      newStatus: 'New',
    });

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! A verified agent will contact you shortly.',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lead manually (Agent / Admin)
// @route   POST /api/leads
// @access  Protected (Agent / Admin)
const createLead = async (req, res, next) => {
  try {
    const {
      leadName,
      customerName,
      phone,
      email,
      assignedAgent,
      status = 'New',
      interestedProject,
      budget,
      preferredUnitType,
      nextFollowup,
      city,
      source = 'Manual Entry',
      notes,
    } = req.body;

    const name = leadName || customerName;
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Lead name and phone number are required.',
      });
    }

    // Resolve assigned agent if provided
    let agentId = null;
    let agentName = assignedAgent || req.user.name;
    const foundAgent = await User.findOne({
      $or: [{ name: agentName }, ...(agentName.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: agentName }] : [])],
    });
    if (foundAgent) {
      agentId = foundAgent._id;
      agentName = foundAgent.name;
    }

    const lead = await Lead.create({
      customerName: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      assignedAgent: agentName,
      assignedAgentId: agentId,
      status,
      interestedProject: interestedProject || 'EstateHub Showcase',
      budget: Number(budget) || 0,
      preferredUnitType: preferredUnitType || '3 BHK',
      nextFollowUpAt: nextFollowup || '2026-10-31',
      city: city || 'Hyderabad',
      source,
      notes: notes || '',
      temperature: 'Warm',
    });

    await LeadActivity.create({
      leadId: lead._id,
      actorId: req.user._id,
      activityType: 'note',
      description: `Lead created manually by ${req.user.name}`,
      newStatus: status,
    });

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status, follow-up, or assigned agent
// @route   PUT /api/leads/:id
// @access  Protected (Agent / Admin)
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead record not found.',
      });
    }

    // Role check: Agents can only update their own assigned leads
    if (
      req.user.role === 'agent' &&
      lead.assignedAgentId &&
      lead.assignedAgentId.toString() !== req.user._id.toString() &&
      lead.assignedAgent !== req.user.name
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to update leads assigned to you.',
      });
    }

    const prevStatus = lead.status;
    const { status, temperature, notes, nextFollowup, assignedAgent, budget, newNote } = req.body;

    if (status) lead.status = status;
    if (temperature) lead.temperature = temperature;
    if (notes !== undefined) lead.notes = notes;
    if (nextFollowup) lead.nextFollowUpAt = nextFollowup;
    if (budget !== undefined) lead.budget = Number(budget);

    // Reassign agent (Admin only or authorized agent)
    if (assignedAgent && req.user.role === 'admin') {
      lead.assignedAgent = assignedAgent;
      const foundAgent = await User.findOne({ name: assignedAgent, role: { $in: ['agent', 'admin'] } });
      if (foundAgent) lead.assignedAgentId = foundAgent._id;
    }

    await lead.save();

    // Create Activity log
    if (status && status !== prevStatus) {
      await LeadActivity.create({
        leadId: lead._id,
        actorId: req.user._id,
        activityType: 'status_change',
        description: `Status changed from '${prevStatus}' to '${status}' by ${req.user.name}`,
        previousStatus: prevStatus,
        newStatus: status,
      });
    }

    if (newNote) {
      await LeadActivity.create({
        leadId: lead._id,
        actorId: req.user._id,
        activityType: 'note',
        description: newNote,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createEnquiry,
  createLead,
  updateLead,
};
