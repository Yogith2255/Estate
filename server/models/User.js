const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'agent', 'admin', 'org_admin', 'super_admin'],
        message: 'Role must be customer, agent, admin, org_admin, or super_admin',
      },
      default: 'customer',
      index: true,
    },
    // organisationId is set for org_admin and agent roles.
    // null for customer and super_admin.
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: 'Status must be active, inactive, or suspended',
      },
      default: 'active',
      index: true,
    },
    // Kept for backward compatibility with existing code using .agency
    agency: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Helper to check if user is an organisation-level staff (admin or agent) 
userSchema.methods.isOrgStaff = function () {
  return ['admin', 'agent', 'org_admin'].includes(this.role);
};

// Helper to check if user has elevated platform privileges
userSchema.methods.isSuperAdmin = function () {
  return this.role === 'super_admin';
};

// Safe JSON serialization — never expose passwordHash
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
