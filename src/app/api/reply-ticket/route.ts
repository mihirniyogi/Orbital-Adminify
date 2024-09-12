import { getCourseInfoFromId, modifyTicket } from "../../db/firebase";
import { CREATED, SERVER_ERROR, UnknownError } from "../../errors/errors";
import { NextResponse } from "next/server";
import { sendEmail } from "../../utils/email";

export async function POST(request: Request) {
  try {
    // Step 1: Get modified ticket details
    const modifiedTicketDetails = await request.json();
    const { courseId, ticketId, reply } = modifiedTicketDetails;

    // Step 2: Modify ticket details
    const ticketDetails = await modifyTicket(courseId, ticketId, reply);

    // Step 3: Retrieve ticket, course details
    const { reason, description, account_id } = ticketDetails;
    const { name } = await getCourseInfoFromId(courseId);

    // Step 4: Send email notification to student
    const emailData = {
      ticketId,
      courseName: name,
      reason,
      description,
      reply,
    };
    await sendEmail(
      account_id,
      `Response to your ticket ${ticketId}`,
      `Your ticket ${ticketId} has received a response.`,
      "reply_ticket.html",
      emailData
    );

    // Step 5: Response
    return NextResponse.json(
      { message: `Closed ticket ${ticketId}` },
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
