const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    // ─── Organisation Ownership (REQUIRED for multi-tenancy) ───────────────────
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: [true, 'Organisation ID is required'],
      index: true,
    },

    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    developerName: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    locality: {
      type: String,
      trim: true,
      default: '',
    },
    fullAddress: {
      type: String,
      trim: true,
      default: '',
    },
    propertyCategory: {
      type: String,
      trim: true,
      default: 'Luxury High-rise',
      index: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Starting price must be positive'],
    },
    totalUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    possessionDate: {
      type: String,
      trim: true,
      default: 'Ready to Move',
    },
    reraNumber: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['upcoming', 'under-construction', 'ready-to-move', 'completed', 'Under Construction', 'Ready to Move', 'Newly Launched', 'Completed'],
        message: 'Invalid project status',
      },
      default: 'under-construction',
      index: true,
    },
    // published controls public marketplace visibility
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual getters for frontend compatibility
projectSchema.virtual('name').get(function () {
  return this.projectName;
});

projectSchema.virtual('location').get(function () {
  return this.fullAddress || (this.locality ? `${this.locality}, ${this.city}` : this.city);
});

projectSchema.virtual('propertyType').get(function () {
  return this.propertyCategory;
});

projectSchema.index({ organisationId: 1, city: 1, status: 1 });
projectSchema.index({ city: 1, propertyCategory: 1, status: 1 });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
