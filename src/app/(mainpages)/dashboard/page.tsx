"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/UserContext";
import TicketTable from "../tickets/TicketTable";
import {
  Course,
  STATUS_COLOUR_MAP,
  STUDENT_COURSES_KEY,
  TA_COURSES_KEY,
  Ticket,
  TICKETS_KEY,
} from "../../constants/constants";
import Link from "next/link";
import Announcements from "../../components/Announcements";
import CourseCard from "../../components/CourseCard";

const Dashboard = () => {
  const { userInfo } = useAppContext();
  const [courses, setCourses] = useState<Course[]>([]);

  const desiredHeaders: (keyof Ticket)[] = [
    "Created",
    "Course",
    "Reason",
    "Description",
  ];

  // fetch courses
  useEffect(() => {
    async function fetchCourses() {
      // fetch all courses
      const studentCoursesFromCanvas =
        localStorage.getItem(STUDENT_COURSES_KEY);
      const taCoursesFromCanvas = localStorage.getItem(TA_COURSES_KEY);
      const allCoursesFromCanvas = [
        ...JSON.parse(studentCoursesFromCanvas || "[]"),
        ...JSON.parse(taCoursesFromCanvas || "[]"),
      ];

      const allCoursesData: Course[] = allCoursesFromCanvas.map(
        (courseObj: any) => ({
          id: String(courseObj.id),
          code: courseObj.course_code,
          name: courseObj.name,
        })
      );

      setCourses(allCoursesData);
    }

    fetchCourses();
  }, []);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  return (
    <main className="flex flex-col flex-1 mx-8 space-y-8">
      <h1 className="mt-8 text-3xl font-bold text-center">
        Welcome, {userInfo.name}
      </h1>

      {/* Tickets group */}
      <div className="flex flex-col space-y-4">
        {/* Title */}
        <h2 className="text-2xl font-semibold">Tickets Overview</h2>

        {/* Tables */}
        <div className="flex space-x-4">
          {/* Table group 1 */}
          <div className="flex-col space-y-1 w-1/2 p-4 rounded-lg shadow-lg border border-yellow-400">
            <h3
              className={`text-xl font-semibold inline-block px-3 py-1 rounded-md ${STATUS_COLOUR_MAP["In review"]}`}
            >
              Pending Reply
            </h3>
            <TicketTable
              headers={desiredHeaders}
              ticketsKey={TICKETS_KEY}
              filterBy={{ key: "Status", value: "In review" }}
              sortBy={[{ key: "Created", ascending: false }]}
              rowLimit={4}
            />
          </div>

          {/* Table group 2 */}
          <div className="flex-col space-y-1 w-1/2 p-4 rounded-lg shadow-lg border border-green-400">
            <h3
              className={`text-xl font-semibold inline-block px-3 py-1 rounded-md ${STATUS_COLOUR_MAP["Closed"]}`}
            >
              Closed
            </h3>
            <TicketTable
              headers={desiredHeaders}
              ticketsKey={TICKETS_KEY}
              filterBy={{ key: "Status", value: "Closed" }}
              sortBy={[{ key: "Created", ascending: false }]}
              rowLimit={4}
            />
          </div>
        </div>

        {/* Link */}
        <div>
          <Link
            href={`/tickets`}
            className="inline-block bg-brand-purple text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-orange hover:text-gray-700 transition duration-300"
          >
            See All Tickets
          </Link>
        </div>
      </div>

      {/* Announcements + Courses group */}
      <div className="flex space-x-4">
        {/* Announcements */}
        <div className="flex flex-col space-y-4 w-1/2">
          <h2 className="text-2xl font-semibold">Recent Announcements</h2>
          <div className="w-full bg-white p-4 rounded-lg shadow-lg border border-gray-400">
            <Announcements
              courses={courses}
              showCode={true}
              startDate={startDate}
            />
          </div>
        </div>

        {/* Courses */}
        <div className="flex flex-col space-y-4 w-1/2">
          <h2 className="text-2xl font-semibold">Your Courses</h2>
          {/* If nonzero courses, show this */}
          {courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {/* Courses */}
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
          {/* If zero courses, show this */}
          {courses.length === 0 && (
            <div className="w-full bg-white p-4 rounded-lg shadow-lg border border-gray-400 text-gray-noinfo">
              No courses available.{" "}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
