"use client";

import { useAppContext } from "../../../context/UserContext";
import React from "react";
import StudentCourseView from "./StudentCourseView";
import ProfessorCourseView from "./ProfessorCourseView";

const CourseDetails = ({
  params = { courseid: 0 },
}: {
  params: { courseid: number };
}) => {
  const { userInfo } = useAppContext();
  return userInfo.role === "Student" ? (
    <StudentCourseView courseid={params.courseid} />
  ) : (
    <ProfessorCourseView courseid={params.courseid} />
  );
};

export default CourseDetails;
