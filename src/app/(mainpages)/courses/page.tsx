"use client";

import CourseCard from "../../components/CourseCard";
import {
  Course,
  PROF_COURSES_KEY,
  STUDENT_COURSES_KEY,
  TA_COURSES_KEY,
} from "../../constants/constants";
import { useAppContext } from "../../context/UserContext";
import React, { useEffect, useState } from "react";

const Courses = () => {
  const { userInfo } = useAppContext();

  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [taCourses, setTaCourses] = useState<Course[]>([]);
  const [profCourses, setProfCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch courses from local storage
    setStudentCourses(
      JSON.parse(localStorage.getItem(STUDENT_COURSES_KEY) || "[]").map(
        (courseObj: any) => ({
          id: courseObj.id,
          code: courseObj.course_code,
          name: courseObj.name,
        })
      )
    );

    setTaCourses(
      JSON.parse(localStorage.getItem(TA_COURSES_KEY) || "[]").map(
        (courseObj: any) => ({
          id: courseObj.id,
          code: courseObj.course_code,
          name: courseObj.name,
        })
      )
    );

    setProfCourses(
      JSON.parse(localStorage.getItem(PROF_COURSES_KEY) || "[]").map(
        (courseObj: any) => ({
          id: courseObj.id,
          code: courseObj.course_code,
          name: courseObj.name,
        })
      )
    );
  }, []);

  return userInfo.role === "Student" ? (
    <main className="container flex flex-col flex-1 mx-auto ml-8 space-y-8">
      <h1 className="mt-8 text-3xl font-bold">Courses</h1>

      <div className="w-full flex-col space-y-4">
        <h2 className="text-xl font-semibold">{"Courses you're taking"}</h2>
        {studentCourses.length === 0 ? (
          <p className="text-gray-noinfo">No courses</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
            {studentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      <div className="w-full flex-col space-y-4">
        <h2 className="text-xl font-semibold">{"Courses you're teaching"}</h2>
        {taCourses.length === 0 ? (
          <p className="text-gray-noinfo">No courses</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
            {taCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  ) : (
    <main className="container flex flex-col flex-1 mx-auto ml-8 space-y-8">
      <h1 className="mt-8 text-3xl font-bold">Courses</h1>

      <div className="w-full space-y-4">
        <h2 className="text-xl font-semibold">{"Courses you're teaching"}</h2>
        {profCourses.length === 0 ? (
          <p className="text-gray-noinfo">No courses</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
            {profCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Courses;
