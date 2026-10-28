const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ customerId: 1, propertyId: 1 }, { unique: true, sparse: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
