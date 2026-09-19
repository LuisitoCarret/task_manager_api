export class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid Data") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}
