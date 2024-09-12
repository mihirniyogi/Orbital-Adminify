import { NextResponse } from "next/server";
import { updatePassword } from "../../db/firebase";
import { randomBytes } from "crypto";
import {
  UserNotFoundError,
  UnknownError,
  SamePasswordError,
  UNAUTHORIZED,
  SERVER_ERROR,
  SUCCESS,
} from "../../errors/errors";
import { sendEmail } from "../../utils/email";

export async function POST(request: Request) {
  try {
    // Step 1: Get user details
    const { email } = await request.json();

    // Step 2: Generate random password and update password
    const newPassword = randomBytes(10).toString("hex");
    await updatePassword(email, newPassword);

    // Step 3: Send Email
    await sendEmail(
      email,
      "Password Reset",
      "Your password has been reset. Please login with the new password.",
      "forgot_password.html",
      {
        newPassword,
      }
    );

    // Step 4: Send response back
    return NextResponse.json(
      { message: `Password for ${email} successfully reset.` },
      { status: SUCCESS }
    );
  } catch (error) {
    if (
      error instanceof UserNotFoundError ||
      error instanceof SamePasswordError
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
