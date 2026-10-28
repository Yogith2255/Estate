const Unit = require('../models/Unit');
const UnitType = require('../models/UnitType');
const Project = require('../models/Project');

// @desc    Get all units / inventory with filters
// @route   GET /api/inventory
// @access  Public / Staff
const getInventory = async (req, res, next) => {
  try {
    const { projectId, status, search, limit = 100, page = 1 } = req.query;

    const query = {};
    if (projectId) query.projectId = projectId;
    if (status && status !== 'all') query.status = status;

    const units = await Unit.find(query)
      .populate('projectId', 'projectName city locality')
      .populate('unitTypeId', 'name bedrooms bathrooms area price')
      .sort({ floor: 1, unitNumber: 1 })
      .limit(Number(limit));

    // Format for frontend DataTable if needed
    const formatted = units.map((u) => ({
      id: u._id,
      unit: u.unitNumber,
      project: u.projectId ? u.projectId.projectName : 'Unassigned',
      projectId: u.projectId ? u.projectId._id : null,
      type: u.unitTypeId ? u.unitTypeId.name : `${u.area} sqft`,
      area: `${u.area} sq ft`,
      floor: `${u.floor}`,
      price: u.price,
      status: u.status,
    }));

    return res.status(200).json({
      success: true,
      message: 'Inventory retrieved successfully.',
      data: {
        units: formatted,
        rawUnits: units,
        total: formatted.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new unit to inventory
// @route   POST /api/inventory
// @access  Protected (Admin / Agent)
const addUnit = async (req, res, next) => {
  try {
    const { projectId, unitTypeId, unitNumber, floor, area, price, status } = req.body;

    if (!projectId || !unitNumber || !price || !area) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, unit number, area, and price are required.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Check duplicate unit in project
    const existing = await Unit.findOne({ projectId, unitNumber: unitNumber.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Unit ${unitNumber} already exists in project ${project.projectName}.`,
      });
    }

    const unit = await Unit.create({
      projectId,
      unitTypeId: unitTypeId || null,
      unitNumber: unitNumber.trim(),
      floor: Number(floor) || 1,
      area: Number(area),
      price: Number(price),
      status: status || 'available',
    });

    // Update project available units count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { totalUnits: 1, availableUnits: 1 },
    });

    return res.status(201).json({
      success: true,
      message: 'Unit added to inventory successfully.',
      data: { unit },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update unit status or details
// @route   PUT /api/inventory/:id
// @access  Protected (Admin / Agent)
const updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, price, floor, area } = req.body;

    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found.',
      });
    }

    // Rule: Prevent ordinary edit turning 'booked' or 'sold' to 'available' without administrative check
    if (
      (unit.status === 'booked' || unit.status === 'sold' || unit.status === 'Booking') &&
      (status === 'available' || status === 'Available') &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can release booked or sold units back to available.',
      });
    }

    if (status) unit.status = status;
    if (price !== undefined) unit.price = Number(price);
    if (floor !== undefined) unit.floor = Number(floor);
    if (area !== undefined) unit.area = Number(area);

    await unit.save();

    return res.status(200).json({
      success: true,
      message: 'Unit updated successfully.',
      data: { unit },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Unit Type
// @route   POST /api/unit-types
// @access  Protected (Admin / Agent)
const createUnitType = async (req, res, next) => {
  try {
    const { projectId, name, description, bedrooms, bathrooms, area, price, floorPlanImage, amenities } = req.body;

    if (!projectId || !name || !area || !price) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, name, area, and price are required.',
      });
    }

    const unitType = await UnitType.create({
      projectId,
      name: name.trim(),
      description: description || '',
      bedrooms: Number(bedrooms) || 2,
      bathrooms: Number(bathrooms) || 2,
      area: Number(area),
      price: Number(price),
      floorPlanImage: floorPlanImage || '',
      amenities: Array.isArray(amenities) ? amenities : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Unit type created successfully.',
      data: { unitType },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  addUnit,
  updateUnit,
  createUnitType,
};
