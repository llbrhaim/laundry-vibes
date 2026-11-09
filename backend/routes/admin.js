'use strict';
const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const Service = require('../models/Service');
const Offer = require('../models/Offer');
const { slugify } = require('../utils/slugify');

const SERVICE_FIELDS = [
  'name', 'slug', 'description', 'category', 'price',
  'unit', 'image', 'icon', 'isActive', 'sortOrder',
];
const OFFER_FIELDS = [
  'title', 'description', 'discountType', 'discountValue',
  'terms', 'startDate', 'endDate', 'isActive',
];

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

// Only copy known fields from the request body (blocks unexpected/malicious keys)
function pick(body, fields) {
  const out = {};
  for (const key of fields) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

const bad = (res, message, status = 400) => res.status(status).json({ error: message });
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

async function uniqueSlug(base) {
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Service.exists({ slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

module.exports = function adminRoutes({ adminUsername, adminPassword }) {
  const router = express.Router();

  // ---------- Auth ----------
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  });

  router.post('/login', loginLimiter, (req, res, next) => {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return bad(res, 'Username and password are required.');
    }
    // Evaluate both so timing doesn't reveal which one was wrong
    const userOk = safeEqual(username, adminUsername);
    const passOk = safeEqual(password, adminPassword);
    if (!(userOk && passOk)) return bad(res, 'Invalid username or password.', 401);

    // New session id on login (prevents session fixation)
    return req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.isAdmin = true;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      return req.session.save((err2) => {
        if (err2) return next(err2);
        return res.json({ csrfToken: req.session.csrfToken });
      });
    });
  });

  const requireAdmin = (req, res, next) => {
    if (req.session && req.session.isAdmin) return next();
    return bad(res, 'Please sign in to continue.', 401);
  };

  const csrfProtect = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const sent = req.get('x-csrf-token') || '';
    const expected = req.session.csrfToken || '';
    if (
      !expected ||
      sent.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected))
    ) {
      return bad(res, 'Security check failed. Please sign in again.', 403);
    }
    return next();
  };

  router.use(requireAdmin, csrfProtect);

  router.param('id', (req, res, next, id) => {
    if (!/^[a-f\d]{24}$/i.test(id)) return bad(res, 'Invalid id.');
    return next();
  });

  router.get('/me', (req, res) => res.json({ csrfToken: req.session.csrfToken }));

  router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('lv.sid');
      return res.status(204).end();
    });
  });

  // ---------- Services ----------
  router.get('/services', async (req, res, next) => {
    try {
      const services = await Service.find().sort({ sortOrder: 1, name: 1 }).select('-__v').lean();
      res.json({ services });
    } catch (err) { next(err); }
  });

  router.post('/services', async (req, res, next) => {
    try {
      if (!isPlainObject(req.body)) return bad(res, 'Invalid request.');
      const data = pick(req.body, SERVICE_FIELDS);
      if (!data.icon) data.icon = 'bi-droplet';
      if (data.image == null) data.image = '';
      const wanted = typeof data.slug === 'string' && data.slug.trim() ? data.slug : '';
      data.slug = wanted ? slugify(wanted) : await uniqueSlug(slugify(data.name));
      const service = await Service.create(data);
      res.status(201).json({ service });
    } catch (err) { next(err); }
  });

  router.patch('/services/:id/price', async (req, res, next) => {
    try {
      const { price } = req.body || {};
      if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > 100000) {
        return bad(res, 'Enter a price between ₹0 and ₹100,000.');
      }
      const service = await Service.findById(req.params.id);
      if (!service) return bad(res, 'Service not found.', 404);
      service.price = price;
      await service.save();
      return res.json({ service });
    } catch (err) { return next(err); }
  });

  router.patch('/services/:id/status', async (req, res, next) => {
    try {
      const { isActive } = req.body || {};
      if (typeof isActive !== 'boolean') return bad(res, 'isActive must be true or false.');
      const service = await Service.findById(req.params.id);
      if (!service) return bad(res, 'Service not found.', 404);
      service.isActive = isActive;
      await service.save();
      return res.json({ service });
    } catch (err) { return next(err); }
  });

  router.patch('/services/:id', async (req, res, next) => {
    try {
      if (!isPlainObject(req.body)) return bad(res, 'Invalid request.');
      const service = await Service.findById(req.params.id);
      if (!service) return bad(res, 'Service not found.', 404);
      const data = pick(req.body, SERVICE_FIELDS);
      if ('icon' in data && !data.icon) data.icon = 'bi-droplet';
      if ('image' in data && data.image == null) data.image = '';
      if ('slug' in data) {
        data.slug =
          typeof data.slug === 'string' && data.slug.trim() ? slugify(data.slug) : service.slug;
      }
      service.set(data);
      await service.save();
      return res.json({ service });
    } catch (err) { return next(err); }
  });

  router.delete('/services/:id', async (req, res, next) => {
    try {
      const removed = await Service.findByIdAndDelete(req.params.id);
      if (!removed) return bad(res, 'Service not found.', 404);
      return res.status(204).end();
    } catch (err) { return next(err); }
  });

  // ---------- Offers ----------
  router.get('/offers', async (req, res, next) => {
    try {
      const offers = await Offer.find().sort({ startDate: -1 }).select('-__v').lean();
      res.json({ offers });
    } catch (err) { next(err); }
  });

  router.post('/offers', async (req, res, next) => {
    try {
      if (!isPlainObject(req.body)) return bad(res, 'Invalid request.');
      const offer = await Offer.create(pick(req.body, OFFER_FIELDS));
      res.status(201).json({ offer });
    } catch (err) { next(err); }
  });

  router.patch('/offers/:id', async (req, res, next) => {
    try {
      if (!isPlainObject(req.body)) return bad(res, 'Invalid request.');
      const offer = await Offer.findById(req.params.id);
      if (!offer) return bad(res, 'Offer not found.', 404);
      offer.set(pick(req.body, OFFER_FIELDS));
      await offer.save();
      return res.json({ offer });
    } catch (err) { return next(err); }
  });

  router.delete('/offers/:id', async (req, res, next) => {
    try {
      const removed = await Offer.findByIdAndDelete(req.params.id);
      if (!removed) return bad(res, 'Offer not found.', 404);
      return res.status(204).end();
    } catch (err) { return next(err); }
  });

  return router;
};
