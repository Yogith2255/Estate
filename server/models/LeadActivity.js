const mongoose = require('mongoose');

const leadActivitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required'],
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    activityType: {
      type: String,
      enum: ['note', 'status_change', 'call', 'email', 'meeting', 'site_visit'],
      default: 'note',
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
    },
    previousStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const LeadActivity = mongoose.model('LeadActivity', leadActivitySchema);
module.exports = LeadActivity;
