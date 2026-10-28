const Property = require('../models/Property');
const mongoose = require('mongoose');
const Project = require('../models/Project');

// @desc    Get properties with full filtering, sorting, pagination
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const {
      listingType,
      propertyType,
      search,
      featuredOnly,
      city,
      minPrice,
      maxPrice,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      page = 1,
    } = req.query;

    const query = {};

    if (listingType && listingType !== 'all') {
      query.listingType = listingType.toLowerCase();
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyType = { $regex: new RegExp(`^${propertyType}$`, 'i') };
    }

    if (city && city !== 'all') {
      query['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (featuredOnly === 'true' || featuredOnly === true) {
      query.featured = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } },
        { 'address.street': { $regex: q, $options: 'i' } },
        { 'address.neighborhood': { $regex: q, $options: 'i' } },
        { 'address.zipCode': { $regex: q, $options: 'i' } },
      ];
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const sortConfig = {};
    if (sortBy === 'price_asc') {
      sortConfig.price = 1;
    } else if (sortBy === 'price_desc') {
      sortConfig.price = -1;
    } else {
      sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('projectId', 'projectName')
      .sort(sortConfig)
      .skip(skip)
      .limit(parsedLimit);
    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully.',
      data: {
        properties,
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let property = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      property = await Property.findById(id)
        .populate('projectId', 'projectName');
    } else {
      // Allow lookup by custom ID if seeded (e.g., 'prop-101')
      property = await Property.findOne({
        $or: [{ _id: id }, { 'specs.customId': id }],
      }).populate('projectId', 'projectName');
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Property details retrieved successfully.',
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Protected (Agent / Admin)
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      price,
      projectId,
      listingType = 'sale',
      propertyType = 'apartment',
      street = '',
      city = 'Hyderabad',
      state = 'Telangana',
      zipCode = '500032',
      neighborhood = '',
      beds = 3,
      baths = 3,
      sqft = 1850,
      description = '',
      amenities = [],
      images = [],
      featured = false,
      status = 'active',
    } = req.body;

    if (!title || !price || !sqft) {
      return res.status(400).json({
        success: false,
        message: 'Title, price, and square footage are required fields.',
      });
    }
    let selectedProject = null;

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID.',
        });
      }

      selectedProject = await Project.findOne({
        _id: projectId,
        organisationId: req.user.organisationId,
      });

      if (!selectedProject && req.user.role === 'super_admin') {
        selectedProject = await Project.findById(projectId);
      }

      if (!selectedProject) {
        return res.status(400).json({
          success: false,
          message: 'Selected project was not found or does not belong to your organisation.',
        });
      }
    }

    // YOUR EXISTING CODE CONTINUES HERE
    const defaultImages = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    ];



    const property = await Property.create({
      organisationId: selectedProject
        ? selectedProject.organisationId
        : req.user.organisationId,

      title: title.trim(),
      price: Number(price),
      listingType,
      propertyType,
      projectId: selectedProject ? selectedProject._id : null,
      status,
      featured: Boolean(featured),
      address: {
        street,
        city,
        state,
        zipCode,
        neighborhood,
      },
      specs: {
        beds: Number(beds) || 2,
        baths: Number(baths) || 2,
        sqft: Number(sqft),
        lotSize: 'N/A',
        yearBuilt: new Date().getFullYear(),
        garageSpaces: 1,
      },
      images: images.length ? images : defaultImages,
      agent: {
        id: req.user._id.toString(),
        name: req.user.name,
        agency: req.user.agency || 'EstateHub Prime Realty Group',
        phone: req.user.phone || '+91 98450 11980',
        email: req.user.email,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      },
      agentId: req.user._id,
      description,
      amenities: Array.isArray(amenities) && amenities.length ? amenities : ['100% Power Backup', 'Lift Access', '24x7 Security', 'Covered Parking'],
    });

    return res.status(201).json({
      success: true,
      message: 'Property listing created successfully.',
      data: { property },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Protected (Agent / Admin)
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found.',
      });
    }

    // Agents can only edit their own listings unless admin
    if (req.user.role === 'agent' && property.agentId && property.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to edit your own property listings.',
      });
    }

    const updated = await Property.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Property listing updated successfully.',
      data: { property: updated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Protected (Admin only)
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
