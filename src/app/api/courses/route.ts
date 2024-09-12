import { SERVER_ERROR, SUCCESS, UnknownError } from "../../errors/errors";
import { NextResponse } from "next/server";
import { extractDetailsFromCookies } from "../../utils/cookies";

export async function GET(request: Request) {
  try {
    // Step 1: Get user's Canvas Token from cookies
    const accountDetails = await extractDetailsFromCookies();
    const canvasToken = accountDetails.canvasToken;
    const email = accountDetails.id;

    // Step 2: Get courses from Canvas API
    const studentCourses = await getCoursesFromCanvas(canvasToken, 0); // 0 for student
    const TACourses = await getCoursesFromCanvas(canvasToken, 1); // 1 for TA
    const profCourses = await getCoursesFromCanvas(canvasToken, 2); // 2 for Professor

    // Step 3: Send response back
    return NextResponse.json(
      {
        studentCourses: studentCourses,
        TACourses: TACourses,
        profCourses: profCourses,
        id: email,
      },
      { status: SUCCESS }
    );
  } catch (error) {
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}

// Function to get courses from Canvas API based on user's token
async function getCoursesFromCanvas(canvasToken: string, type: number) {
  const courseType: string[] = ["student", "ta", "professor"];

  // Fetch courses from Canvas API
  const response = await fetch(
    "https://canvas.nus.edu.sg/api/v1/courses?enrollment_type=" +
      courseType[type],
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${canvasToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Canvas failed: ${response.statusText}`);
  }
  // Filter out courses
  const unfilteredCourses = await response.json();
  const courses = unfilteredCourses.filter((course: any) => {
    if (course.access_restricted_by_date || course.name === undefined) {
      return false;
    }
    return true;
  });

  // returns an array of course objects. [Course Object 1, Course Object 2...]
  return courses;
}
