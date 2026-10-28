const mongoose = require('mongoose');

const unitTypeSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Unit type name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    bedrooms: {
      type: Number,
      default: 2,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: 2,
      min: 0,
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    floorPlanImage: {
      type: String,
      trim: true,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

unitTypeSchema.index({ projectId: 1, name: 1 });

const UnitType = mongoose.model('UnitType', unitTypeSchema);
module.exports = UnitType;
