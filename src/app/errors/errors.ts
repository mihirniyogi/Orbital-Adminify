// --------------------------
// Error-codes
// --------------------------
export const SUCCESS = 200;
export const CREATED = 201;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const SERVER_ERROR = 500;

// --------------------------
// General
// --------------------------
export class UnknownError extends Error {
  constructor() {
    super("Unknown error");
    this.name = "UnknownError";
  }
}

// --------------------------
// Input Validation for Signup
// --------------------------
export class EmptyFieldsError extends Error {
  constructor() {
    super("Empty fields not allowed");
    this.name = "EmptyFieldsError";
  }
}

export class NotMatchingPasswordsError extends Error {
  constructor() {
    super("Passwords do not match");
    this.name = "NotMatchingPasswordsError";
  }
}

export class InvalidSecretKeyError extends Error {
  constructor() {
    super("Invalid secret key");
    this.name = "InvalidSecretKeyError";
  }
}

export class InvalidStudentNumError extends Error {
  constructor() {
    super("Invalid student number");
    this.name = "InvalidStudentNumError";
  }
}

export class InvalidEmailDomainError extends Error {
  constructor() {
    super("Invalid email domain");
    this.name = "InvalidEmailDomainError";
  }
}

// --------------------------
// Login
// --------------------------
export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class WrongPasswordError extends Error {
  constructor() {
    super("Wrong password");
    this.name = "WrongPasswordError";
  }
}

export class UnauthorisedError extends Error {
  constructor() {
    super("Unauthorised");
    this.name = "UnauthorisedError";
  }
}

// --------------------------
// Forgot Password
// --------------------------
export class SamePasswordError extends Error {
  constructor() {
    super("Password is the same");
    this.name = "SamePasswordError";
  }
}

// --------------------------
// Database
// --------------------------
export class DuplicateEntryError extends Error {
  constructor() {
    super("Duplicate entry");
    this.name = "DuplicateEntryError";
  }
}

export class UnknownDBError extends Error {
  constructor() {
    super("Unknown database error");
    this.name = "UnknownDBError";
  }
}

// --------------------------
// Canvas
// --------------------------
export class CanvasError extends Error {
  constructor() {
    super("Canvas failed");
    this.name = "CanvasError";
  }
}
