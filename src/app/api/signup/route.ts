import { NextResponse } from "next/server";
import { createStudentAccount, createLecturerAccount } from "../../db/firebase";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import { JWT_TOKEN, MAX_AGE, STAFF_SECRET } from "../../constants/constants";
import {
  BAD_REQUEST,
  SERVER_ERROR,
  CREATED,
  DuplicateEntryError,
  EmptyFieldsError,
  InvalidSecretKeyError,
  InvalidStudentNumError,
  NotMatchingPasswordsError,
  CanvasError,
  UnknownDBError,
  UnknownError,
  InvalidEmailDomainError,
} from "../../errors/errors";
import { isValidStudentId } from "../../utils/checksum";
import { createCookie } from "../../utils/cookies";

// Server-side API route (signs up user)
export async function POST(request: Request) {
  try {
    // Step 1: Get user details
    const userDetails = await request.json();
    const {
      role,
      email,
      canvasToken,
      studentNumber,
      password,
      confirmPassword,
      key,
    } = userDetails;

    // Step 2: Input validation
    if (!email || !canvasToken || !password || !confirmPassword) {
      throw new EmptyFieldsError();
    }

    if (password !== confirmPassword) {
      throw new NotMatchingPasswordsError();
    }

    if (role === "professor" && key !== STAFF_SECRET) {
      throw new InvalidSecretKeyError();
    }

    if (role === "student") {
      if (!isValidStudentId(studentNumber)) {
        throw new InvalidStudentNumError();
      }
      if (!email.endsWith("u.nus.edu")) {
        throw new InvalidEmailDomainError();
      }
    }

    let accountDetails;

    // Step 3: Create account
    if (role === "student") {
      accountDetails = await createStudentAccount(
        email,
        canvasToken,
        password,
        studentNumber
      );
    } else {
      accountDetails = await createLecturerAccount(
        email,
        canvasToken,
        password
      );
    }

    // Step 4: Create cookie
    const cookie = createCookie(accountDetails);

    // Step 5: Send response back
    return NextResponse.json(
      { message: `${accountDetails.full_name} signed up successfully!` },
      {
        status: CREATED,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    if (
      error instanceof EmptyFieldsError ||
      error instanceof NotMatchingPasswordsError ||
      error instanceof InvalidSecretKeyError ||
      error instanceof InvalidStudentNumError ||
      error instanceof DuplicateEntryError ||
      error instanceof CanvasError ||
      error instanceof UnknownDBError
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: BAD_REQUEST }
      );
    }

    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
