import { NextResponse } from "next/server";
import { login } from "../../db/firebase";
import {
  UserNotFoundError,
  WrongPasswordError,
  UnknownError,
  SUCCESS,
  UNAUTHORIZED,
  SERVER_ERROR,
} from "../../errors/errors";
import { createCookie } from "../../utils/cookies";

export async function POST(request: Request) {
  try {
    // Step 1: Get user details
    const { email, password } = await request.json();
    const accountDetails = await login(email, password);

    // Step 2: Create cookie
    const cookie = createCookie(accountDetails);

    // Step 3: Send response back
    return NextResponse.json(
      { message: `${accountDetails.full_name} logged in successfully` },
      {
        status: SUCCESS,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    if (
      error instanceof UserNotFoundError ||
      error instanceof WrongPasswordError
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: UNAUTHORIZED }
      );
    }

    // Unknown error
    console.log(error);
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
