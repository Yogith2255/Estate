const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: [true, 'Organisation ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      index: true,
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
      index: true,
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent'],
      default: 'sale',
      index: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold'],
      default: 'active',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: true, index: true },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      neighborhood: { type: String, default: '' },
    },
    specs: {
      beds: { type: Number, default: 2 },
      baths: { type: Number, default: 2 },
      sqft: { type: Number, required: true },
      lotSize: { type: String, default: 'N/A' },
      yearBuilt: { type: Number, default: 2024 },
      garageSpaces: { type: Number, default: 1 },
    },
    images: {
      type: [String],
      default: [],
    },
    agent: {
      id: { type: String, default: '' },
      name: { type: String, default: 'EstateHub Executive' },
      agency: { type: String, default: 'EstateHub Prime Realty Group' },
      phone: { type: String, default: '+91 98450 11980' },
      email: { type: String, default: 'concierge@estatehub.in' },
      avatar: { type: String, default: '' },
    },
    agentId: {
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
    description: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

propertySchema.index({ 'address.city': 1, listingType: 1, propertyType: 1, price: 1 });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
