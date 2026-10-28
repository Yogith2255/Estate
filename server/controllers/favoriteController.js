const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Get favorites for authenticated customer
// @route   GET /api/favorites
// @access  Protected
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ customerId: req.user._id })
      .populate('propertyId')
      .populate('projectId')
      .sort({ createdAt: -1 });

    const properties = favorites
      .map((f) => f.propertyId)
      .filter((p) => p !== null);

    return res.status(200).json({
      success: true,
      message: 'Favorites retrieved successfully.',
      data: {
        favorites,
        properties,
        count: properties.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a property to favorites
// @route   POST /api/favorites
// @access  Protected
const addFavorite = async (req, res, next) => {
  try {
    const { propertyId, projectId } = req.body;

    if (!propertyId && !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID or Project ID is required.',
      });
    }

    const query = { customerId: req.user._id };
    if (propertyId) query.propertyId = propertyId;
    if (projectId) query.projectId = projectId;

    // Check existing
    const existing = await Favorite.findOne(query);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Item is already in your saved list.',
        data: { favorite: existing },
      });
    }

    const favorite = await Favorite.create({
      customerId: req.user._id,
      propertyId: propertyId || null,
      projectId: projectId || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Saved to favorites successfully.',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a property from favorites
// @route   DELETE /api/favorites/:id
// @access  Protected
const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support deletion either by favorite document ID or propertyId
    const deleted = await Favorite.findOneAndDelete({
      customerId: req.user._id,
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { propertyId: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    return res.status(200).json({
      success: true,
      message: 'Item removed from favorites.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a property is favorited
// @route   GET /api/favorites/check/:propertyId
// @access  Protected
const checkFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const favorite = await Favorite.findOne({
      customerId: req.user._id,
      propertyId: propertyId.match(/^[0-9a-fA-F]{24}$/) ? propertyId : null,
    });

    return res.status(200).json({
      success: true,
      data: { isSaved: Boolean(favorite) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};
