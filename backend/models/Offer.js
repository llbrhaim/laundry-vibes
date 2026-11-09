'use strict';
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required.'],
      trim: true,
      maxlength: [100, 'Offer title must be 100 characters or fewer.'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be 500 characters or fewer.'],
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required.'],
      enum: {
        values: ['percentage', 'fixed'],
        message: 'Discount type must be "percentage" or "fixed".',
      },
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required.'],
      min: [0.01, 'Discount value must be greater than 0.'],
      max: [100000, 'Discount value is too large.'],
    },
    terms: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Terms must be 500 characters or fewer.'],
    },
    startDate: { type: Date, required: [true, 'Start date is required.'] },
    endDate: { type: Date, required: [true, 'End date is required.'] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

offerSchema.pre('validate', function () {
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    this.invalidate('discountValue', 'A percentage discount cannot be more than 100.');
  }
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after the start date.');
  }
});

module.exports = mongoose.model('Offer', offerSchema);
