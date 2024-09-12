import Link from "next/link";
import React from "react";
import { Course } from "../constants/constants";

const CourseCard = ({ key, course }: { key: string; course: Course }) => {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="flex items-center transition duration-300 transform bg-white border rounded-lg shadow-md cursor-pointer border-brand-purple hover:scale-105">
        <div className="px-4 py-6 truncate">
          <h2 className="text-xl font-semibold ">{course.code}</h2>
          <p className="text-gray-700 truncate">{course.name}</p>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
