"use client";

import {
  Reason,
  STATUS_COLOUR_MAP,
  Status,
  Ticket,
} from "../../constants/constants";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const TicketTable = ({
  headers,
  ticketsKey,
  filterBy,
  sortBy = [],
  rowLimit,
  onRefresh,
}: {
  headers: (keyof Ticket)[];
  ticketsKey: string;
  filterBy?: {
    key: keyof Ticket;
    value: any;
  };
  sortBy?: {
    key: keyof Ticket;
    ascending: boolean;
  }[];
  rowLimit?: number;
  onRefresh?: () => void;
}) => {
  const router = useRouter();

  const [originalTickets, setOriginalTickets] = useState<Ticket[]>([]);
  const [processedTickets, setProcessedTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    async function fetchTicketsLocally() {
      try {
        const ticketData: Ticket[] = JSON.parse(
          localStorage.getItem(ticketsKey) || "[]"
        ).map((ticketObj: any) => ({
          "Ticket ID": ticketObj.id,
          Created: new Date(ticketObj.timestamp),
          Reason: ticketObj.reason as Reason,
          Description: ticketObj.description,
          Status: ticketObj.status as Status,
          Reply: ticketObj.reply,
          Student: ticketObj.studentName,
          Course: ticketObj.courseCode,
          Assigned: ticketObj.professorName,
        }));

        setOriginalTickets(ticketData);
        setProcessedTickets(ticketData); // Initially set filteredTickets to all tickets
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    }

    fetchTicketsLocally();
  }, [ticketsKey, onRefresh]);

  // Filter + Sort
  useEffect(() => {
    // Filter tickets
    let filtered: Ticket[];
    if (!filterBy || !filterBy.key || !filterBy.value) {
      filtered = [...originalTickets];
    } else {
      filtered = originalTickets.filter(
        (ticket) => ticket[filterBy.key] === filterBy.value
      );
    }

    // Sort tickets
    let sorted: Ticket[] = filtered.sort((a, b) => {
      for (const { key, ascending } of sortBy) {
        const aValue = a[key];
        const bValue = b[key];

        if (aValue === undefined || bValue === undefined) {
          continue; // Skip undefined values
        }

        if (aValue < bValue) {
          return ascending ? -1 : 1;
        }
        if (aValue > bValue) {
          return ascending ? 1 : -1;
        }
      }
      return 0; // If all comparisons are equal
    });

    // Limit tickets
    if (rowLimit) {
      sorted = sorted.slice(0, rowLimit);
    }

    setProcessedTickets(sorted);
  }, [filterBy, sortBy, originalTickets, rowLimit]); // Depend on filterBy, sortBy, originalTickets

  return (
    <div className="w-full">
      {/* Table */}
      <table className="w-full border border-gray-300">
        {/* Headers */}
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header: any) => (
              <th key={header} className="px-4 py-2 text-left border-b">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Content population */}
        <tbody>
          {processedTickets.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-2 text-center">
                no entries yet...
              </td>
            </tr>
          ) : (
            processedTickets.map((ticket) => (
              <tr
                onClick={() => router.push(`/tickets/${ticket["Ticket ID"]}`)}
                key={ticket["Ticket ID"]}
                className="hover:bg-slate-200 hover:font-semibold hover:cursor-pointer"
              >
                {headers.map((key) => (
                  <td
                    key={key}
                    className={`py-2 px-4 border-b ${
                      key === "Status" ? STATUS_COLOUR_MAP[ticket[key]] : ""
                    } ${key === "Description" ? "max-w-[200px] truncate" : ""}`}
                  >
                    {key === "Created"
                      ? new Date(ticket[key]).toDateString()
                      : ticket[key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
