"use client";

import React, { useState } from "react";
import { useAppContext } from "../../context/UserContext";
import { TATICKETS_KEY, TICKETS_KEY, Ticket } from "../../constants/constants";
import Link from "next/link";
import TicketTable from "./TicketTable";
import { FiRefreshCw } from "react-icons/fi";
import {
  fetchTATicketsAndStoreLocally,
  fetchTicketsAndStoreLocally,
} from "../../utils/fetch";
import LoadingSpinner from "../../components/LoadingSpinner";
const Tickets = () => {
  const { userInfo } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);

  const desiredStudentHeaders: (keyof Ticket)[] = [
    "Ticket ID",
    "Created",
    "Course",
    "Reason",
    "Description",
    "Assigned",
    "Status",
  ];

  const desiredTAHeaders: (keyof Ticket)[] = [
    "Ticket ID",
    "Created",
    "Student",
    "Course",
    "Reason",
    "Description",
    "Status",
    "Reply",
  ];

  const desiredProfHeaders: (keyof Ticket)[] = [
    "Ticket ID",
    "Created",
    "Student",
    "Course",
    "Reason",
    "Description",
    "Status",
    "Reply",
  ];

  // gets passed down to TicketTable component
  const handleRefresh = async () => {
    setLoading(true);
    await fetchTicketsAndStoreLocally();
    await fetchTATicketsAndStoreLocally();
    setLoading(false);
  };

  return (
    <main className="flex flex-col flex-1 items-start h-full mx-8 space-y-8">
      {/* Loading Indicator */}
      {loading && <LoadingSpinner />}

      {/* Title */}
      <h1 className="mt-8 text-3xl font-bold">Tickets</h1>

      {/* Students / TA Tickets */}
      {userInfo.role === "Student" && (
        <div className="flex flex-col w-full space-y-8">
          {/* Student Tickets Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{"Tickets you raised"}</h2>
            <TicketTable
              headers={desiredStudentHeaders}
              ticketsKey={TICKETS_KEY}
              // filterBy={{ key: "Course", value: "CS2030S" }}
              sortBy={[
                { key: "Status", ascending: false },
                { key: "Created", ascending: false },
              ]}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Button group */}
          <div className="flex flex-row space-x-2">
            {/* New Ticket button */}
            <Link
              href="/tickets/new-ticket"
              className="bg-brand-purple text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-orange hover:text-gray-700 transition duration-300"
            >
              + New Ticket
            </Link>
            {/* Refresh Tickets button */}
            <button
              onClick={handleRefresh}
              className="bg-brand-purple text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-orange hover:text-gray-700 transition duration-300"
            >
              <FiRefreshCw size={24} />
            </button>
          </div>

          {/* TA Tickets Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {"Tickets assigned to you"}
            </h2>
            <TicketTable
              headers={desiredTAHeaders}
              ticketsKey={TATICKETS_KEY}
              sortBy={[
                { key: "Status", ascending: false },
                { key: "Created", ascending: false },
              ]}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      )}

      {/* Professor Tickets */}
      {userInfo.role === "Professor" && (
        <div className="w-full">
          {/* TA Tickets Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {"Tickets assigned to you"}
            </h2>
            <TicketTable
              headers={desiredProfHeaders}
              ticketsKey={TICKETS_KEY}
              sortBy={[
                { key: "Status", ascending: false },
                { key: "Created", ascending: false },
              ]}
              onRefresh={handleRefresh}
            />
            {/* Refresh Tickets button */}
            <button
              onClick={handleRefresh}
              className="bg-brand-purple text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-orange hover:text-gray-700 transition duration-300"
            >
              <FiRefreshCw size={24} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Tickets;
