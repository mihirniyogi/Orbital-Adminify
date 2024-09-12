import {
  CanvasError,
  SERVER_ERROR,
  SUCCESS,
  UnknownError,
} from "../../errors/errors";
import { NextResponse } from "next/server";
import { extractDetailsFromCookies } from "../../utils/cookies";

export async function GET(request: Request) {
  try {
    // Step 1: Get course details from request
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const id = searchParams.get("courseId");
    const course_id = "course_" + id;
    if (!course_id) {
      throw new Error("Course ID is missing in the request");
    }

    // Step 2: Get canvas token from cookies
    const accountDetails = await extractDetailsFromCookies();
    const canvasToken = accountDetails.canvasToken;

    // Step 3: Set date range
    const today = new Date();

    const endDate = today.toISOString().split("T")[0];
    const startDate = new Date(new Date().setMonth(today.getMonth() - 5))
      .toISOString()
      .split("T")[0];

    // Step 4: Fetch announcements from canvas api
    const response = await fetch(
      `https://canvas.nus.edu.sg/api/v1/announcements?context_codes[]=${course_id}&start_date=${startDate}&end_date=${endDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${canvasToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new CanvasError();
    }

    // Step 5: Retrieve announcement data
    const announcements = await response.json();

    // Step 6: Response
    return NextResponse.json(
      {
        message: announcements,
      },
      { status: SUCCESS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
