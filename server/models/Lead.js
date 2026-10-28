const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    interestedProject: {
      type: String,
      trim: true,
      default: '',
    },
    unitTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UnitType',
      default: null,
    },
    interestedPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedAgent: {
      type: String,
      trim: true,
      default: 'Vikram Malhotra',
    },
    source: {
      type: String,
      trim: true,
      default: 'Website Enquiry',
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    preferredLocation: {
      type: String,
      trim: true,
      default: '',
    },
    preferredUnitType: {
      type: String,
      trim: true,
      default: '3 BHK',
    },
    city: {
      type: String,
      trim: true,
      default: 'Hyderabad',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: [
          'new', 'contacted', 'qualified', 'site-visit', 'negotiation', 'booking', 'converted', 'lost',
          'New', 'Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Booking', 'Converted', 'Lost'
        ],
        message: 'Invalid lead status',
      },
      default: 'New',
      index: true,
    },
    temperature: {
      type: String,
      enum: ['cold', 'warm', 'hot', 'Cold', 'Warm', 'Hot'],
      default: 'Warm',
    },
    nextFollowUpAt: {
      type: String,
      default: '2026-10-30',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for compatibility with existing frontend columns
leadSchema.virtual('leadName').get(function () {
  return this.customerName;
});

leadSchema.virtual('nextFollowup').get(function () {
  return this.nextFollowUpAt;
});

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
