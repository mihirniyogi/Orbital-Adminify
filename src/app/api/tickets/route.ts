import {
  getCourseInfoFromId,
  getProfessorFromTicket,
  getTickets,
  getUserInfo,
} from "../../db/firebase";
import {
  SERVER_ERROR,
  SUCCESS,
  UnknownError,
} from "../../../app/errors/errors";
import { NextResponse } from "next/server";
import { extractDetailsFromCookies } from "../../utils/cookies";

export async function GET(request: Request) {
  try {
    // Step 1: Get user's email from cookies
    const accountDetails = await extractDetailsFromCookies();
    const email = accountDetails.id;

    // Step 2: Using accountRef, fetch tickets
    const ticketObjs = await getTickets(email);

    // Step 3: include course code, student name, prof name
    for (let ticketObj of ticketObjs) {
      const courseData = await getCourseInfoFromId(ticketObj.courseId);
      ticketObj.courseCode = courseData.code;
      const studentData = await getUserInfo(ticketObj.account_id);
      ticketObj.studentName = studentData.full_name;

      try {
        const profData = await getProfessorFromTicket(
          ticketObj.courseId,
          ticketObj.id
        );
        ticketObj.professorName = profData.full_name;
      } catch (error) {
        ticketObj.professorName = "--";
      }
    }

    // Step 4: Return the ticketObjs
    return NextResponse.json({ message: ticketObjs }, { status: SUCCESS });
  } catch (error) {
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
