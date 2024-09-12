"use client";

import React from "react";
import ProfessorTicketView from "./ProfessorTicketView";
import StudentTicketView from "./StudentTicketView";
import { useAppContext } from "../../../context/UserContext";

const TicketDetails = ({
  params = { ticketid: 0 },
}: {
  params: { ticketid: number };
}) => {
  const { userInfo } = useAppContext();

  return userInfo.role === "Student" ? (
    <StudentTicketView ticketid={params.ticketid} />
  ) : (
    <ProfessorTicketView ticketid={params.ticketid} />
  );
};

export default TicketDetails;
