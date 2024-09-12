"use client";

import { fetchTicketsAndStoreLocally } from "../../../utils/fetch";
import { Reason, Status, STATUS_COLOUR_MAP, TICKETS_KEY } from "../../../constants/constants";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";

type File = {
  name: string;
  url: string;
};

type Ticket = {
  "Ticket ID": string;
  CourseId: string;
  Created: Date;
  Student: string;
  Course: string;
  Reason: Reason;
  Description: string;
  Status: Status;
  Reply?: string;
};

const ProfessorTicketView = ({ ticketid }: { ticketid: number }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    courseId: ticket?.CourseId,
    ticketId: ticket?.["Ticket ID"],
    reply: "",
  });

  useEffect(() => {
    async function fetchTickets() {
      try {
        const ticketDataFromDB = JSON.parse(
          localStorage.getItem(TICKETS_KEY) || "[]"
        );
        const ticketData: Ticket[] = ticketDataFromDB.map((ticketObj: any) => ({
          "Ticket ID": ticketObj.id,
          CourseId: ticketObj.courseId,
          Created: new Date(ticketObj.timestamp),
          Course: ticketObj.courseCode,
          Student: ticketObj.studentName,
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

        setFormData((prevData) => ({
          ...prevData,
          courseId: individualTicketData.CourseId,
          ticketId: individualTicketData["Ticket ID"],
        }));
      } catch (error) {
        console.log("Error in GET Request");
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

    fetchTickets();
    fetchFile();
  }, [ticketid]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log(formData);

      const response = await fetch("/api/reply-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Alert user of failure
      if (!response.ok) {
        throw new Error(`Error replying to ticket: ${response.statusText}`);
      }

      // Successful reply
      alert(`Reply sent to ${ticket?.Student}`);
      await fetchTicketsAndStoreLocally();
      setLoading(false);
      router.push("/tickets");
    } catch (error) {
      console.log(`Error: ${error}`);
      setLoading(false);
    }
  };

  return ticket ? (
    <main className="flex flex-col items-start flex-1 h-full mx-8 space-y-8">
      {/* Loading Indicator */}
      {loading && <LoadingSpinner />}

      {/* Heading */}
      <h1 className="mt-8 text-3xl font-bold">Tickets</h1>

      {/* Ticket properties */}
      <div className="flex flex-col w-full space-y-4 text-lg">
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

        {/* Student */}
        <p>
          <span className="font-semibold">Student</span>: {ticket.Student}
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

        {/* Reply Form */}
        {ticket.Status !== "Closed" ? (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <label htmlFor="reply" className="font-semibold">
              Reply to {ticket.Student}:
            </label>
            <textarea
              name="reply"
              id="reply"
              value={formData.reply}
              onChange={handleChange}
              rows={5}
              className="w-1/3 p-2 border border-gray-700 rounded-lg focus:border-black"
            ></textarea>
            <button
              type="submit"
              className="w-1/3 p-4 text-xl text-white transition-colors duration-300 rounded-md shadow-md bg-brand-purple hover:bg-gray-700"
            >
              Reply
            </button>
          </form>
        ) : (
          <div className="flex flex-col space-y-2">
            <label htmlFor="reply" className="font-semibold">
              You replied
            </label>
            <p className="w-1/3 p-2 whitespace-pre-wrap border border-gray-700 rounded-lg focus:border-black">
              {ticket.Reply}
            </p>
          </div>
        )}
      </div>
    </main>
  ) : null;
};

export default ProfessorTicketView;
