/**
 * server.ts — Fastify entry point for ImobCreator Creative Engine
 *
 * Railway deployment: PORT from env, host 0.0.0.0
 */
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { creativeJobsRoutes } from './routes/creative-jobs.js';
import { templatesRoutes } from './routes/templates.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { agentsRoutes } from './routes/agents.js';
import { webhooksRoutes } from './routes/webhooks.js';
import { explainabilityRoutes } from './routes/explainability.js';

const app = Fastify({
  logger: true,
});

// Plugins
await app.register(cors, { origin: true });
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// Routes
await app.register(creativeJobsRoutes);
await app.register(templatesRoutes);
await app.register(onboardingRoutes);
await app.register(agentsRoutes);
await app.register(webhooksRoutes);
await app.register(explainabilityRoutes);

// Health check
app.get('/health', async () => ({ status: 'ok', service: 'imobcreator-creative-engine' }));

// Start
const port = parseInt(process.env.PORT ?? '3001', 10);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
  console.log(`🚀 Creative Engine running on ${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
