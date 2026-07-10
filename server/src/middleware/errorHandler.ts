import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log full error server-side
  console.error('Error occurred:', err);

  // If headers are already sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      message: `Validation failed: ${messages}`,
      code: 'VALIDATION_ERROR'
    });
  }

  // Handle App-specific or standard Errors
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = (err as AppError).code || 'INTERNAL_ERROR';

  return res.status(statusCode).json({
    message,
    code
  });
};
