const Project = require('../models/Project');
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const User = require('../models/User');
const Lead = require('../models/Lead');
const SiteVisit = require('../models/SiteVisit');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const LeadActivity = require('../models/LeadActivity');

// @desc    Get Admin Executive Dashboard Statistics
// @route   GET /api/dashboard/admin
// @access  Protected (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalProjects,
      projectsList,
      totalProperties,
      totalUnits,
      availableUnits,
      totalCustomers,
      totalAgents,
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      bookingsCount,
      siteVisitsCount,
      totalPaymentsResult,
      leadsPipelineResult,
      recentActivities,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.find().select('projectName city startingPrice totalUnits availableUnits status'),
      Property.countDocuments(),
      Unit.countDocuments(),
      Unit.countDocuments({ status: { $in: ['available', 'Available'] } }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'agent' }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: { $in: ['new', 'New'] } }),
      Lead.countDocuments({ status: { $in: ['qualified', 'Qualified', 'Site Visit'] } }),
      Lead.countDocuments({ status: { $in: ['converted', 'Converted'] } }),
      Booking.countDocuments(),
      SiteVisit.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Lead.aggregate([{ $group: { _id: null, total: { $sum: '$budget' } } }]),
      LeadActivity.find()
        .populate('leadId', 'customerName interestedProject')
        .populate('actorId', 'name role')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    // Calculate aggregated inventory from projects if units collection is smaller
    const projectTotalUnits = projectsList.reduce((acc, p) => acc + (p.totalUnits || 0), 0);
    const projectAvailableUnits = projectsList.reduce((acc, p) => acc + (p.availableUnits || 0), 0);

    const totalPipeline = leadsPipelineResult[0]?.total || 0;
    const totalPayments = totalPaymentsResult[0]?.total || 0;

    const auditEvents = recentActivities.map((act) => ({
      id: act._id,
      event: act.description,
      agent: act.actorId ? act.actorId.name : 'System Concierge',
      time: new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: act.newStatus || 'Updated',
    }));

    return res.status(200).json({
      success: true,
      message: 'Admin metrics retrieved successfully.',
      data: {
        totalProjects,
        totalProperties,
        totalUnits: Math.max(totalUnits, projectTotalUnits),
        availableUnits: totalUnits > 0 ? availableUnits : projectAvailableUnits,
        totalCustomers,
        totalAgents,
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
        bookingsCount,
        siteVisitsCount,
        totalPayments,
        totalPipeline,
        projects: projectsList.slice(0, 5),
        auditEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Agent Dashboard Statistics
// @route   GET /api/dashboard/agent
// @access  Protected (Agent / Admin)
const getAgentStats = async (req, res, next) => {
  try {
    const agentName = req.user.name;
    const agentId = req.user._id;

    const agentLeadQuery = {
      $or: [{ assignedAgentId: agentId }, { assignedAgent: agentName }],
    };

    const [
      assignedLeads,
      agentProperties,
      upcomingVisits,
      recentFollowups,
      convertedCount,
    ] = await Promise.all([
      Lead.find(agentLeadQuery).sort({ createdAt: -1 }),
      Property.find({
        $or: [{ agentId }, { 'agent.name': agentName }, { 'agent.id': agentId.toString() }],
      }),
      SiteVisit.find({
        $or: [{ assignedAgentId: agentId }, { agent: agentName }],
      }).sort({ scheduledAt: 1 }),
      Lead.find({
        ...agentLeadQuery,
        nextFollowUpAt: { $exists: true, $ne: 'Completed' },
      }).limit(5),
      Lead.countDocuments({
        ...agentLeadQuery,
        status: { $in: ['converted', 'Converted', 'Booking'] },
      }),
    ]);

    const activeListingsCount = agentProperties.length;
    const totalLeadsCount = assignedLeads.length;

    return res.status(200).json({
      success: true,
      message: 'Agent metrics retrieved successfully.',
      data: {
        totalLeads: totalLeadsCount,
        activeListings: activeListingsCount,
        upcomingSiteVisitsCount: upcomingVisits.length,
        followupsDueCount: recentFollowups.length,
        convertedCount,
        leads: assignedLeads.slice(0, 5),
        properties: agentProperties.slice(0, 4),
        siteVisits: upcomingVisits.slice(0, 4),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAgentStats,
};
