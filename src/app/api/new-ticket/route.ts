import { extractDetailsFromCookies } from "../../utils/cookies";
import {
  createNewTicket,
  getCourseInfoFromId,
  getProfessors,
  getUserInfo,
} from "../../db/firebase";
import { CREATED, SERVER_ERROR, UnknownError } from "../../errors/errors";
import { NextResponse } from "next/server";
import { sendEmail } from "../../utils/email";
import { uploadImage } from "../../db/fireStorage";

export async function POST(request: Request) {
  try {
    // Step 1: Get new ticket details
    const formData = await request.formData();
    const courseId = formData.get("courseId") as string;
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;
    const fileName = file ? file.name : "";

    // Step 2: Assign a Professor
    const professors = await getProfessors(courseId);
    const profAssignedEmail =
      professors.length > 0 ? professors[0].id || "" : ""; // just choosing the first one for now

    // Step 3: Decide status based on whether professor was found
    const status = profAssignedEmail === "" ? "Unassigned" : "In review";

    // Step 4: Get Student Email
    const accountDetails = await extractDetailsFromCookies();

    // Step 5: Create a new ticket in DB
    const ticketDetails = await createNewTicket(
      courseId,
      reason,
      description,
      profAssignedEmail,
      status,
      accountDetails.id
    );

    // Step 6: Save file (if any) to storage
    if (file) {
      await uploadImage(file, fileName, ticketDetails.id);
    }

    // Step 7: Retrieve student name, course details
    const { full_name } = await getUserInfo(accountDetails.id);
    const { name } = await getCourseInfoFromId(courseId);

    // Step 8: Send email notification to professor
    const emailData = {
      studentName: full_name,
      courseCode: name,
      reason,
      description,
    };

    if (profAssignedEmail) {
      await sendEmail(
        accountDetails.id, // ONLY FOR TESTING: to be changed to profAssignedEmail
        `New Ticket Assigned`,
        `You have been assigned a new ticket ${ticketDetails.id}`,
        "new_ticket.html",
        emailData
      );
    }

    // Step 9: Return response
    return NextResponse.json(
      { message: `Created ticket ${ticketDetails.id} for ${courseId}` },
      { status: CREATED }
    );
  } catch (error) {
    // Unknown error
    console.log(error);
    return NextResponse.json(
      { message: new UnknownError().message },
      { status: SERVER_ERROR }
    );
  }
}
