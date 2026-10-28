const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organisation name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [200, 'Name cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    organisationType: {
      type: String,
      enum: {
        values: ['developer', 'brokerage', 'franchise', 'independent', 'enterprise'],
        message: 'Invalid organisation type',
      },
      default: 'developer',
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
      // This is NOT verified by the platform; it is self-declared
    },
    reraNumber: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'active', 'suspended'],
        message: 'Status must be pending, active, or suspended',
      },
      default: 'active',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // The user who first created / registered this org (typically a super_admin action)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for display purposes
organisationSchema.virtual('displayStatus').get(function () {
  const map = { pending: 'Pending Approval', active: 'Active', suspended: 'Suspended' };
  return map[this.status] || this.status;
});

const Organisation = mongoose.model('Organisation', organisationSchema);
module.exports = Organisation;
