import { extractDetailsFromCookies } from "../../utils/cookies";
import { updatePassword, passCheckDB } from "../../db/firebase";
import {
  SERVER_ERROR,
  UNAUTHORIZED,
  NotMatchingPasswordsError,
  SamePasswordError,
  UserNotFoundError,
  WrongPasswordError,
  UnknownError,
  SUCCESS,
} from "../../errors/errors";
import { NextResponse } from "next/server";

// Server-side API route (changes password)
export async function POST(request: Request) {
  try {
    // Step 1: Get user details
    const { oldPassword, newPassword, confirmNewPassword } =
      await request.json();

    // Step 2: Get user's email from cookies
    const accountDetails = await extractDetailsFromCookies();
    const email = accountDetails.id;

    // Step 3: Check if old password is correct
    const check = await passCheckDB(email, oldPassword);
    if (!check) {
      throw new WrongPasswordError();
    }

    // Step 4: Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      throw new NotMatchingPasswordsError();
    }

    // Step 5: Change Password
    await updatePassword(email, newPassword);

    // Step 6: Send response back
    return NextResponse.json(
      { message: `Password for ${email} successfully reset.` },
      { status: SUCCESS }
    );
  } catch (error) {
    if (
      error instanceof UserNotFoundError ||
      error instanceof SamePasswordError ||
      error instanceof WrongPasswordError ||
      error instanceof NotMatchingPasswordsError
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: UNAUTHORIZED }
      );
    }
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
