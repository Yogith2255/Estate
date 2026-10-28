const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    unitTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UnitType',
      default: null,
    },
    unitNumber: {
      type: String,
      required: [true, 'Unit number is required'],
      trim: true,
    },
    floor: {
      type: Number,
      default: 1,
    },
    area: {
      type: Number,
      required: [true, 'Unit area is required'],
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'reserved', 'booked', 'sold', 'Available', 'Reserved', 'Booking', 'Sold'],
        message: 'Invalid unit status',
      },
      default: 'available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

unitSchema.index({ projectId: 1, unitNumber: 1 }, { unique: true });

const Unit = mongoose.model('Unit', unitSchema);
module.exports = Unit;
