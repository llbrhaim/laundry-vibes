'use strict';
/**
 * Smoke test. Needs a MongoDB to talk to (uses a throw-away database).
 *   TEST_MONGODB_URI=mongodb://127.0.0.1:27017/laundryvibes_test npm test
 */
const assert = require('assert');
const mongoose = require('mongoose');
const { createApp } = require('../app');

const URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/laundryvibes_test';
const USER = 'owner';
const PASS = 'a-strong-test-password';

let base;
let cookie = '';
let csrf = '';

// Same behaviour as src/api.js in the frontend
async function api(path, { method = 'GET', body, auth = true, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && cookie) headers.Cookie = cookie;
  const t = token === undefined ? csrf : token;
  if (t && !['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-CSRF-Token'] = t;
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  return { status: res.status, data };
}

let passed = 0;
async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (err) {
    console.error(`FAIL  ${name}\n      ${err.message}`);
    process.exitCode = 1;
  }
}

(async () => {
  await mongoose.connect(URI);
  await mongoose.connection.dropDatabase();
  const app = createApp({
    adminUsername: USER,
    adminPassword: PASS,
    sessionSecret: 'x'.repeat(40),
  });
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  const server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;

  let serviceId;
  let offerId;

  await check('public lists are empty at first', async () => {
    const s = await api('/services', { auth: false });
    const o = await api('/offers', { auth: false });
    assert.deepStrictEqual(s.data, { services: [] });
    assert.deepStrictEqual(o.data, { offers: [] });
  });

  await check('admin routes blocked when logged out (401)', async () => {
    assert.strictEqual((await api('/admin/me')).status, 401);
    assert.strictEqual((await api('/admin/services')).status, 401);
    assert.strictEqual((await api('/admin/services', { method: 'POST', body: {} })).status, 401);
  });

  await check('wrong password rejected', async () => {
    const r = await api('/admin/login', { method: 'POST', body: { username: USER, password: 'nope' } });
    assert.strictEqual(r.status, 401);
    assert.ok(r.data.error);
  });

  await check('login works and returns csrfToken', async () => {
    const r = await api('/admin/login', { method: 'POST', body: { username: USER, password: PASS } });
    assert.strictEqual(r.status, 200);
    assert.ok(r.data.csrfToken && r.data.csrfToken.length >= 32);
    csrf = r.data.csrfToken;
  });

  await check('/admin/me returns the same csrfToken', async () => {
    const r = await api('/admin/me');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.csrfToken, csrf);
  });

  await check('write without CSRF token is blocked (403)', async () => {
    const r = await api('/admin/services', {
      method: 'POST', token: '', body: { name: 'X', category: 'Y', price: 1 },
    });
    assert.strictEqual(r.status, 403);
  });

  await check('create service (slug auto-generated, defaults applied)', async () => {
    const r = await api('/admin/services', {
      method: 'POST',
      body: {
        name: 'Wash & Fold', slug: '', description: 'Everyday laundry', category: 'Laundry',
        price: 60, unit: 'kg', image: '', icon: 'bi-droplet', isActive: true, sortOrder: 1,
      },
    });
    assert.strictEqual(r.status, 201, JSON.stringify(r.data));
    assert.strictEqual(r.data.service.slug, 'wash-fold');
    serviceId = r.data.service._id;
  });

  await check('second service with same name gets unique slug', async () => {
    const r = await api('/admin/services', {
      method: 'POST',
      body: { name: 'Wash & Fold', category: 'Laundry', price: 80, unit: 'kg', isActive: false, sortOrder: 2 },
    });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.data.service.slug, 'wash-fold-2');
  });

  await check('validation errors come back as { error }', async () => {
    const r1 = await api('/admin/services', { method: 'POST', body: { name: 'A', category: 'B', price: -5 } });
    assert.strictEqual(r1.status, 400);
    assert.match(r1.data.error, /Price/);
    const r2 = await api('/admin/services', { method: 'POST', body: { name: 'A', category: 'B', price: 5, unit: 'bag' } });
    assert.strictEqual(r2.status, 400);
    const r3 = await api('/admin/services', { method: 'POST', body: { name: 'A', category: 'B', price: 5, icon: 'x" onclick="evil' } });
    assert.strictEqual(r3.status, 400);
    const r4 = await api('/admin/services', { method: 'POST', body: { name: 'A', category: 'B', price: 5, image: 'javascript:alert(1)' } });
    assert.strictEqual(r4.status, 400);
  });

  await check('public list only shows ACTIVE services', async () => {
    const r = await api('/services', { auth: false });
    assert.strictEqual(r.data.services.length, 1);
    assert.strictEqual(r.data.services[0].name, 'Wash & Fold');
  });

  await check('admin list shows all services', async () => {
    const r = await api('/admin/services');
    assert.strictEqual(r.data.services.length, 2);
  });

  await check('PATCH full edit, price, and status', async () => {
    let r = await api(`/admin/services/${serviceId}`, {
      method: 'PATCH', body: { name: 'Wash & Fold Premium', category: 'Laundry', price: 70, unit: 'kg' },
    });
    assert.strictEqual(r.status, 200, JSON.stringify(r.data));
    assert.strictEqual(r.data.service.name, 'Wash & Fold Premium');
    r = await api(`/admin/services/${serviceId}/price`, { method: 'PATCH', body: { price: 99.5 } });
    assert.strictEqual(r.data.service.price, 99.5);
    r = await api(`/admin/services/${serviceId}/price`, { method: 'PATCH', body: { price: 'abc' } });
    assert.strictEqual(r.status, 400);
    r = await api(`/admin/services/${serviceId}/status`, { method: 'PATCH', body: { isActive: false } });
    assert.strictEqual(r.data.service.isActive, false);
    const pub = await api('/services', { auth: false });
    assert.strictEqual(pub.data.services.length, 0);
    await api(`/admin/services/${serviceId}/status`, { method: 'PATCH', body: { isActive: true } });
  });

  await check('bad id -> 400, unknown id -> 404', async () => {
    assert.strictEqual((await api('/admin/services/123', { method: 'PATCH', body: {} })).status, 400);
    assert.strictEqual(
      (await api('/admin/services/aaaaaaaaaaaaaaaaaaaaaaaa', { method: 'DELETE', body: {} })).status, 404
    );
  });

  await check('create offers (running now / expired / future)', async () => {
    const day = 86400000;
    const mk = (title, s, e) => ({
      title, description: 'd', discountType: 'percentage', discountValue: 10, terms: '',
      startDate: new Date(Date.now() + s * day).toISOString(),
      endDate: new Date(Date.now() + e * day).toISOString(), isActive: true,
    });
    const now = await api('/admin/offers', { method: 'POST', body: mk('Running', -1, 5) });
    assert.strictEqual(now.status, 201, JSON.stringify(now.data));
    offerId = now.data.offer._id;
    assert.strictEqual((await api('/admin/offers', { method: 'POST', body: mk('Expired', -10, -5) })).status, 201);
    assert.strictEqual((await api('/admin/offers', { method: 'POST', body: mk('Future', 5, 10) })).status, 201);
  });

  await check('offer rules: end>=start, percentage<=100', async () => {
    const bad1 = await api('/admin/offers', {
      method: 'POST',
      body: { title: 'T', discountType: 'percentage', discountValue: 150,
        startDate: new Date().toISOString(), endDate: new Date(Date.now() + 1000).toISOString() },
    });
    assert.strictEqual(bad1.status, 400);
    const bad2 = await api('/admin/offers', {
      method: 'POST',
      body: { title: 'T', discountType: 'fixed', discountValue: 50,
        startDate: new Date(Date.now() + 5000).toISOString(), endDate: new Date().toISOString() },
    });
    assert.strictEqual(bad2.status, 400);
    assert.match(bad2.data.error, /End date/);
  });

  await check('public offers only shows the one running now', async () => {
    const r = await api('/offers', { auth: false });
    assert.strictEqual(r.data.offers.length, 1);
    assert.strictEqual(r.data.offers[0].title, 'Running');
    assert.strictEqual((await api('/admin/offers')).data.offers.length, 3);
  });

  await check('edit and delete offer', async () => {
    const r = await api(`/admin/offers/${offerId}`, { method: 'PATCH', body: { title: 'Running (edited)', discountValue: 15 } });
    assert.strictEqual(r.data.offer.title, 'Running (edited)');
    assert.strictEqual((await api(`/admin/offers/${offerId}`, { method: 'DELETE', body: {} })).status, 204);
    assert.strictEqual((await api('/admin/offers')).data.offers.length, 2);
  });

  await check('delete service', async () => {
    assert.strictEqual((await api(`/admin/services/${serviceId}`, { method: 'DELETE', body: {} })).status, 204);
    assert.strictEqual((await api('/admin/services')).data.services.length, 1);
  });

  await check('logout ends the session', async () => {
    assert.strictEqual((await api('/admin/logout', { method: 'POST', body: {} })).status, 204);
    assert.strictEqual((await api('/admin/me')).status, 401);
  });

  await check('unknown /api route gives JSON 404', async () => {
    const r = await api('/nope', { auth: false });
    assert.strictEqual(r.status, 404);
    assert.ok(r.data.error);
  });

  await check('security headers + health', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-security-policy'));
    assert.strictEqual(res.headers.get('x-powered-by'), null);
  });

  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
  console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures above)' : ''}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
