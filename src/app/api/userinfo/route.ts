import { extractDetailsFromCookies } from "../../utils/cookies";
import {
  SERVER_ERROR,
  SUCCESS,
  UNAUTHORIZED,
  UnauthorisedError,
  UnknownError,
  UserNotFoundError,
} from "../../errors/errors";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Step 1: Get user's account details
    const accountDetails = await extractDetailsFromCookies();

    // Step 2: Send response back
    return NextResponse.json({ message: accountDetails }, { status: SUCCESS });
  } catch (error) {
    if (
      error instanceof UserNotFoundError ||
      error instanceof UnauthorisedError
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
