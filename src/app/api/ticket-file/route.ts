import { getImage } from "@/app/db/fireStorage";
import { SERVER_ERROR, SUCCESS, UnknownError } from "@/app/errors/errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Step 1: Get ticket details from request
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const ticketId = searchParams.get("ticketId");
    if (!ticketId) {
      throw new Error("Ticket ID is missing in the request");
    }
    // Step 2: Fetch ticket file from storage
    const file = await getImage(ticketId);

    // Step 3: Response
    return NextResponse.json({ file }, { status: SUCCESS });
  } catch (error) {
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
