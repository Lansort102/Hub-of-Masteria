import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Если ответ уже был отправлен, передаем ошибку следующему обработчику
  if (res.headersSent) {
    return next(err);
  }

  // Определяем статус код (можно расширить для разных типов ошибок)
  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

