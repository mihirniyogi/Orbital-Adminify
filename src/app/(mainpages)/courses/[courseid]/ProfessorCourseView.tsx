import {
  Course,
  PROF_COURSES_KEY,
  TICKETS_KEY,
  Ticket,
} from "../../../constants/constants";
import React, { useEffect, useState } from "react";
import TicketTable from "../../tickets/TicketTable";
import Announcements from "../../../components/Announcements";

const ProfessorCourseView = ({ courseid }: { courseid: number }) => {
  const [course, setCourse] = useState<Course | null>(null);

  const desiredHeaders: (keyof Ticket)[] = [
    "Ticket ID",
    "Created",
    "Student",
    "Reason",
    "Description",
    "Status",
    "Reply",
  ];

  // fetch individual course details
  useEffect(() => {
    async function fetchCourse() {
      try {
        const profCoursesFromCanvas = JSON.parse(
          localStorage.getItem(PROF_COURSES_KEY) || "[]"
        );
        const profCoursesData: Course[] = profCoursesFromCanvas.map(
          (courseObj: any) => ({
            id: String(courseObj.id),
            code: courseObj.course_code,
            name: courseObj.name,
          })
        );
        const individualCourseData = profCoursesData.find(
          (course) => course.id === courseid.toString()
        );
        if (!individualCourseData) throw new Error("No course found");

        setCourse(individualCourseData);
      } catch (error) {
        console.log(error);
      }
    }

    fetchCourse();
  }, [courseid]);

  return course ? (
    <main className="flex flex-col items-start flex-1 h-full mx-8 space-y-8">
      {/* Title */}
      <h1 className="mt-8 text-3xl font-bold">{course.name}</h1>

      {/* Tickets group */}
      <div className="flex-col w-full space-y-2">
        <h2 className="text-xl font-medium">Tickets for {course.code}</h2>
        <TicketTable
          headers={desiredHeaders}
          ticketsKey={TICKETS_KEY}
          filterBy={{ key: "Course", value: `${course.code}` }}
          sortBy={[{ key: "Created", ascending: false }]}
        />
      </div>

      {/* Announcements group */}
      <Announcements courses={[course]} showCode={false} />
    </main>
  ) : null;
};

export default ProfessorCourseView;
