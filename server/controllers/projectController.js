const Project = require('../models/Project');
const Unit = require('../models/Unit');
const UnitType = require('../models/UnitType');
const Booking = require('../models/Booking');

// @desc    Get all projects with filtering and search
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res, next) => {
  try {
    const { search, city, status, category, featured, sort, limit = 50, page = 1 } = req.query;

    const query = {};

    if (city && city !== 'all') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (status && status !== 'all') {
      query.status = { $regex: new RegExp(status, 'i') };
    }

    if (category && category !== 'all') {
      query.propertyCategory = { $regex: new RegExp(category, 'i') };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { fullAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .sort(sort === 'price_asc' ? { startingPrice: 1 } : sort === 'price_desc' ? { startingPrice: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    return res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully.',
      data: {
        projects,
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID or slug
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let project = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id).populate('createdBy', 'name email agency');
    } else {
      project = await Project.findOne({ slug: id }).populate('createdBy', 'name email agency');
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Also fetch associated unit types
    const unitTypes = await UnitType.find({ projectId: project._id });
    const availableUnitsCount = await Unit.countDocuments({ projectId: project._id, status: { $in: ['available', 'Available'] } });

    return res.status(200).json({
      success: true,
      message: 'Project details retrieved successfully.',
      data: {
        project,
        unitTypes,
        realAvailableUnits: availableUnitsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Protected (Admin / Agent)

const createProject = async (req, res, next) => {
  try {
    const {
      projectName,
      name,
      city,
      locality,
      fullAddress,
      location,
      propertyCategory,
      propertyType,
      startingPrice,
      totalUnits,
      availableUnits,
      possessionDate,
      reraNumber,
      status,
      description,
      amenities,
      images,
      featured,
    } = req.body;

    const title = projectName || name;

    if (!title || !city || startingPrice === undefined || startingPrice === null) {
      return res.status(400).json({
        success: false,
        message: 'Project name, city, and starting price are required.',
      });
    }

    if (!Number.isFinite(Number(startingPrice)) || Number(startingPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Starting price must be a valid non-negative number.',
      });
    }

    // Only platform super-admins may create projects without an organisation.
    // Regular organisation staff must belong to an organisation.
    let organisationId = req.user.organisationId;

    if (req.user.role === 'super_admin') {
      organisationId = req.body.organisationId || organisationId;
    }

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not linked to an organisation. Contact the platform administrator.',
      });
    }

    const slug =
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);

    const project = await Project.create({
      organisationId,
      projectName: title.trim(),
      slug,
      city: city.trim(),
      locality: locality || '',
      fullAddress: fullAddress || location || '',
      propertyCategory: propertyCategory || propertyType || 'Luxury High-rise',
      startingPrice: Number(startingPrice),
      totalUnits: Math.max(0, Number(totalUnits) || 0),
      availableUnits:
        availableUnits !== undefined
          ? Math.max(0, Number(availableUnits) || 0)
          : Math.max(0, Number(totalUnits) || 0),
      possessionDate: possessionDate || 'Ready to Move',
      reraNumber: reraNumber || '',
      status: status || 'under-construction',
      description: description || '',
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      featured: Boolean(featured),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Protected (Admin / Agent)
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Map any alias fields
    const updates = { ...req.body };
    if (updates.name) updates.projectName = updates.name;
    if (updates.location) updates.fullAddress = updates.location;
    if (updates.propertyType) updates.propertyCategory = updates.propertyType;

    const updated = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: {
        project: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project safely
// @route   DELETE /api/projects/:id
// @access  Protected (Admin only)
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check for associated bookings
    const bookingsCount = await Booking.countDocuments({ projectId: id });
    if (bookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete project with ${bookingsCount} active/historical booking(s). Archive or update status instead.`,
      });
    }

    // Delete associated units and unit types
    await Unit.deleteMany({ projectId: id });
    await UnitType.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Project and associated inventory removed successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
