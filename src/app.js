const Fastify = require('fastify');
const { version } = require('../package.json');

function buildApp(options = {}) {
  const app = Fastify({ logger: options.logger ?? false });

  app.get('/health', async () => ({
    status: 'ok',
    version: process.env.APP_VERSION || version,
    uptime: Math.round(process.uptime()),
  }));

  app.get('/api/hello', {
    schema: {
      querystring: {
        type: 'object',
        properties: { name: { type: 'string', minLength: 1, maxLength: 50 } },
      },
    },
  }, async (request) => ({ message: `Hello, ${request.query.name || 'world'}!` }));

  return app;
}

module.exports = { buildApp };
