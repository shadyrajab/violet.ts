export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 403);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(`Database error: ${message}`, 500);
  }
}

export class DiscordApiError extends AppError {
  constructor(message: string) {
    super(`Discord API error: ${message}`, 500);
  }
}
