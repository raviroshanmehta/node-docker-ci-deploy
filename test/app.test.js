const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildApp } = require('../src/app');

test('GET /health reports ok', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const res = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.status, 'ok');
  assert.ok(body.version);
});

test('GET /api/hello greets by name', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const res = await app.inject({ method: 'GET', url: '/api/hello?name=Ravi' });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), { message: 'Hello, Ravi!' });
});

test('GET /api/hello validates the query', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const res = await app.inject({ method: 'GET', url: `/api/hello?name=${'x'.repeat(60)}` });
  assert.equal(res.statusCode, 400);
});
