import { JWT_TOKEN } from "../../../app/constants/constants";
import {
  getCourseInfoFromId,
  getProfessorFromTicket,
  getTATickets,
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
    const ticketObjs = await getTATickets(email);

    // Step 3: include course code, student name, prof name
    for (let ticketObj of ticketObjs) {
      const courseData = await getCourseInfoFromId(ticketObj.courseId);
      ticketObj.courseCode = courseData.code;

      const studentData = await getUserInfo(ticketObj.account_id);
      ticketObj.studentName = studentData.full_name;

      const profData = await getProfessorFromTicket(
        ticketObj.courseId,
        ticketObj.id
      );

      ticketObj.professorName = profData.full_name;
    }

    // console.log(ticketObjs);

    // Step 4: Return the ticketObjs
    return NextResponse.json({ message: ticketObjs }, { status: SUCCESS });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
