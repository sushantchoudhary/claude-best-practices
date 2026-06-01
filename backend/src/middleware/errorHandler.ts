import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

// Central error handler — all routes delegate via next(err)
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';

  // Log full error in development
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} — ${message}`);
    if (statusCode >= 500) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    data: null,
    error: message,
  });
}

// 404 handler for unknown routes
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    data: null,
    error: `Route ${req.method} ${req.path} not found`,
  });
}
