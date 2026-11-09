'use strict';
const mongoose = require('mongoose');

const UNITS = ['kg', 'item', 'pair', 'set'];

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required.'],
      trim: true,
      maxlength: [90, 'Service name must be 90 characters or fewer.'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required.'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [100, 'Slug must be 100 characters or fewer.'],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug may only contain lowercase letters, numbers and hyphens.',
      ],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be 500 characters or fewer.'],
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      trim: true,
      maxlength: [60, 'Category must be 60 characters or fewer.'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price must be between ₹0 and ₹100,000.'],
      max: [100000, 'Price must be between ₹0 and ₹100,000.'],
    },
    unit: {
      type: String,
      enum: { values: UNITS, message: 'Unit must be one of: kg, item, pair, set.' },
      default: 'kg',
    },
    image: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Image URL must be 500 characters or fewer.'],
      validate: {
        validator: (v) => !v || /^https?:\/\/\S+$/i.test(v),
        message: 'Image must be a valid http(s) URL.',
      },
    },
    icon: {
      type: String,
      trim: true,
      default: 'bi-droplet',
      match: [/^bi-[a-z0-9-]+$/, 'Icon must look like "bi-droplet".'],
    },
    isActive: { type: Boolean, default: true },
    sortOrder: {
      type: Number,
      default: 0,
      min: [0, 'Sort order must be between 0 and 10000.'],
      max: [10000, 'Sort order must be between 0 and 10000.'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
