'use strict';
const express = require('express');
const Service = require('../models/Service');
const Offer = require('../models/Offer');

const router = express.Router();

// Public: only active services
router.get('/services', async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('-__v')
      .lean();
    res.set('Cache-Control', 'no-store');
    res.json({ services });
  } catch (err) {
    next(err);
  }
});

// Public: only active offers that are running right now
router.get('/offers', async (req, res, next) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ endDate: 1 })
      .select('-__v')
      .lean();
    res.set('Cache-Control', 'no-store');
    res.json({ offers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
