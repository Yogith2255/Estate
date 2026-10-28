const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    project: {
      type: String,
      trim: true,
      default: '',
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null,
      index: true,
    },
    unit: {
      type: String,
      trim: true,
      default: '',
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    tokenAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending', 'confirmed', 'cancelled', 'completed',
          'Pending', 'Confirmed', 'Cancelled', 'Completed', 'Booking', 'Converted'
        ],
        message: 'Invalid booking status',
      },
      default: 'Pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.virtual('client').get(function () {
  return this.clientName;
});

bookingSchema.virtual('amount').get(function () {
  return this.tokenAmount || this.agreedPrice;
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
