import { createCookie, extractDetailsFromCookies } from "../../utils/cookies";
import { updateToken, getUserInfo } from "../../db/firebase";
import {
  SERVER_ERROR,
  UNAUTHORIZED,
  UserNotFoundError,
  UnknownError,
  SUCCESS,
  CanvasError,
} from "../../errors/errors";
import { NextResponse } from "next/server";
import { create } from "domain";
import { get } from "http";
import { fetchCoursesAndStoreLocally } from "@/app/utils/fetch";

// Server-side API route (changes password)
export async function POST(request: Request) {
  try {
    // Step 1: Get user details
    const { newToken } =
      await request.json();

    // Step 2: Get user's email from cookies
    const accountDetails = await extractDetailsFromCookies();
    const email = accountDetails.id;

    // Step 3: Update Token
    await updateToken(email, newToken);

    const cookie = createCookie(await getUserInfo(email));

    // Step 4: Return response
    return NextResponse.json(
      { message: `Token for ${email} successfully changed.` },
      { status: SUCCESS,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    if (
      error instanceof UserNotFoundError
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: UNAUTHORIZED }
      );
    } 
    if (
      error instanceof CanvasError
    ) {
      return NextResponse.json(
        { message: "Token Invalid" },
        { status: UNAUTHORIZED }
      );
    }
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
