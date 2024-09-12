"use client";

import {
  Reason,
  Status,
  STATUS_COLOUR_MAP,
  TICKETS_KEY,
} from "../../../constants/constants";
import React, { useEffect, useState } from "react";

type File = {
  name: string;
  url: string;
};

type Ticket = {
  "Ticket ID": string;
  CourseId: string;
  Created: Date;
  Course: string;
  Reason: Reason;
  Description: string;
  Status: Status;
  Reply?: string;
};

const StudentTicketView = ({ ticketid }: { ticketid: number }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const ticketDataFromDB = JSON.parse(
          localStorage.getItem(TICKETS_KEY) || "[]"
        );
        const ticketData: Ticket[] = ticketDataFromDB.map((ticketObj: any) => ({
          "Ticket ID": ticketObj.id,
          CourseId: ticketObj.courseId,
          Created: new Date(ticketObj.timestamp),
          Course: ticketObj.courseCode,
          Reason: ticketObj.reason as Reason,
          Description: ticketObj.description,
          Status: ticketObj.status as Status,
          Reply: ticketObj.reply,
        }));

        const individualTicketData = ticketData.find(
          (ticket) => ticket["Ticket ID"] === ticketid.toString()
        );
        if (!individualTicketData) throw new Error("No ticket found");
        setTicket(individualTicketData);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    }

    async function fetchFile() {
      try {
        const response = await fetch(`/api/ticket-file?ticketId=${ticketid}`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Problem fetching image");
        }
        const data = await response.json();
        setFile(data.file);
        console.log(data);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    }

    fetchTicket();
    fetchFile();
  }, [ticketid]);

  return ticket ? (
    <main className="flex flex-col items-start flex-1 h-full mx-8 space-y-8">
      {/* Heading */}
      <h1 className="mt-8 text-3xl font-bold">Tickets</h1>

      {/* Ticket properties */}
      <div className="flex flex-col w-full space-y-2 text-lg">
        {/* ID */}
        <p>
          <span className="font-semibold">ID</span>: {ticket["Ticket ID"]}
        </p>

        {/* Created */}
        <p>
          <span className="font-semibold">Created</span>:{" "}
          {new Date(ticket.Created).toLocaleDateString("en-SG", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Course */}
        <p>
          <span className="font-semibold">Course</span>: {ticket.Course}
        </p>

        {/* Reason */}
        <p>
          <span className="font-semibold">Reason</span>: {ticket.Reason}
        </p>

        {/* Status */}
        <p>
          <span className="font-semibold">Status</span>:{" "}
          <span
            className={`px-2 py-1 rounded-md ${
              STATUS_COLOUR_MAP[ticket.Status]
            }`}
          >
            {ticket.Status}
          </span>
        </p>

        {/* Description */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="description" className="font-semibold">
            Description
          </label>
          <p className="w-1/3 p-2 whitespace-pre-wrap border border-gray-700 rounded-lg focus:border-black">
            {ticket.Description}
          </p>
        </div>

        {/* File */}
        {file && (
          <div className="flex flex-col space-y-2">
            <label className="font-semibold">Attached File</label>
            <p className="w-1/3 p-2 whitespace-pre-wrap border border-gray-700 rounded-lg focus:border-black">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer" // Security feature to prevent tab stealing
                className="text-blue-500 hover:underline"
              >
                {file.name}
              </a>
            </p>
          </div>
        )}

        {/* reply */}
        {ticket.Status === "Closed" ? (
          <div className="flex flex-col space-y-2">
            <label htmlFor="reply" className="font-semibold">
              Professor replied
            </label>
            <p className="w-1/3 p-2 whitespace-pre-wrap border border-gray-700 rounded-lg focus:border-black">
              {ticket.Reply}
            </p>
          </div>
        ) : (
          <label htmlFor="reply" className="font-semibold">
            Pending reply...
          </label>
        )}
      </div>
    </main>
  ) : null;
};

export default StudentTicketView;
