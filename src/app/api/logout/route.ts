import { NextResponse } from "next/server";
import { SUCCESS } from "../../errors/errors";
import { createCookie } from "../../utils/cookies";

export async function POST(request: Request) {
  const expiredCookie = createCookie(null, true);

  return NextResponse.json(
    { message: "Logged out successfully" },
    {
      status: SUCCESS,
      headers: {
        "Set-Cookie": expiredCookie,
      },
    }
  );
}
