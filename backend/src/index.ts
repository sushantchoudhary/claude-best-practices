import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { taskRouter } from './routes/tasks.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Security + parsing middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json());

  // Request logging (skip in tests to keep output clean)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check — used by Docker and load balancers
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/tasks', taskRouter);

  // 404 + error handlers — MUST be last
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Only start the server when this file is run directly (not in tests)
if (process.env.NODE_ENV !== 'test') {
  const port = parseInt(process.env.PORT ?? '3001', 10);
  const app = createApp();

  app.listen(port, () => {
    console.log(`🚀 Backend running at http://localhost:${port}`);
    console.log(`🔍 Health check: http://localhost:${port}/health`);
  });
}
