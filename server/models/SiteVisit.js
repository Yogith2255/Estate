const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null,
    },
    assignedAgentId: {
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
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    project: {
      type: String,
      trim: true,
      default: '',
    },
    agent: {
      type: String,
      trim: true,
      default: 'Vikram Malhotra',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    timeSlot: {
      type: String,
      default: 'Morning (10:00 AM - 1:00 PM)',
    },
    status: {
      type: String,
      enum: {
        values: [
          'requested', 'confirmed', 'completed', 'cancelled', 'rescheduled',
          'Requested', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'Site Visit', 'Qualified', 'Contacted'
        ],
        message: 'Invalid site visit status',
      },
      default: 'Requested',
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

siteVisitSchema.virtual('client').get(function () {
  return this.clientName;
});

siteVisitSchema.virtual('date').get(function () {
  const d = this.scheduledAt ? this.scheduledAt.toISOString().split('T')[0] : '';
  return `${d} (${this.timeSlot})`;
});

const SiteVisit = mongoose.model('SiteVisit', siteVisitSchema);
module.exports = SiteVisit;
