"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../../context/UserContext";
import {
  Course,
  REASONS_ARRAY,
  STUDENT_COURSES_KEY,
} from "../../../constants/constants";
import { fetchTicketsAndStoreLocally } from "../../../utils/fetch";
import LoadingSpinner from "../../../components/LoadingSpinner";

const NewTicket = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { userInfo } = useAppContext();
  const [courses, setCourses] = useState<Course[]>([
    { code: "", name: "Loading...", id: "" },
  ]);

  // Form data to see what's currently selected
  const [formData, setFormData] = useState({
    courseId: "",
    reason: REASONS_ARRAY[0],
    description: "",
  });

  const [file, setFile] = useState<File | null>(null);

  // Fetches courses to display in dropdown
  useEffect(() => {
    async function fetchCourses() {
      try {
        const courseData = JSON.parse(
          localStorage.getItem(STUDENT_COURSES_KEY) || "[]"
        );
        const courseArray: Course[] = courseData.map((obj: any) => ({
          code: obj.course_code,
          name: obj.name,
          id: obj.id,
        }));

        // set courses
        setCourses(courseArray);

        // set form data to first course
        if (courseArray.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            courseId: courseArray[0].id.toString(),
          }));
        }
      } catch (error) {
        console.log("Error: " + error);
      }
    }

    fetchCourses();
  }, []);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        "image/jpeg", // JPG/JPEG
        "image/png", // PNG
        "application/pdf", // PDF
      ];

      // not a valid file type
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Please select a valid file (JPG, JPEG, PNG, or PDF).");
        setFile(null);
        const fileInput = document.getElementById("file") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
        return;
      }

      // valid file type
      setFile(selectedFile);
    }
  };

  // Clear file selection
  const clearFileSelection = () => {
    setFile(null);
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const data = new FormData();
    data.append("courseId", formData.courseId);
    data.append("reason", formData.reason);
    data.append("description", formData.description);
    if (file) {
      data.append("file", file);
    }

    try {
      const response = await fetch("/api/new-ticket", {
        method: "POST",
        body: data,
      });

      // Alerts user of failure
      const responseData = await response.json();
      if (!response.ok) {
        alert(`Error: ${responseData.message}`);
        throw Error(responseData.message);
      }

      // Successfully created ticket
      alert(responseData.message);
      await fetchTicketsAndStoreLocally();
      setLoading(false);
      router.push("/tickets");
    } catch (error) {
      console.log(`Error: ${error}`);
      setLoading(false);
    }
  };

  if (userInfo.role === "Professor") return null;

  return (
    <main className="flex flex-col flex-1 h-full ml-8 space-y-8">
      {/* Loading Indicator */}
      {loading && <LoadingSpinner />}

      <h1 className="mt-8 text-3xl font-bold">New Ticket</h1>

      <form className="flex flex-col w-1/3 space-y-6" onSubmit={handleSubmit}>
        {/* Course dropdown */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="course" className="text-xl font-semibold">
            Course
          </label>
          <select
            id="course"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="p-2 border border-gray-700 rounded-lg shadow-sm focus:border-black"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reason dropdown */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="reason" className="text-xl font-semibold">
            Reason
          </label>
          <select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="p-2 border border-gray-700 rounded-lg shadow-sm focus:border-black"
          >
            {REASONS_ARRAY.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Description input */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="description" className="text-xl font-semibold">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            className="p-2 border border-gray-700 rounded-lg focus:border-black"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* File input */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="file" className="text-xl font-semibold">
            {"Attach image (if any)"}
          </label>
          <span className="text-sm text-gray-600">
            {"Only accepts .jpg .jpeg .png .pdf"}
          </span>

          <div className="flex items-center border border-gray-700 rounded-lg p-2">
            <input
              type="file"
              name="file"
              id="file"
              className="flex-1 p-0 border-none focus:border-black text-gray-600"
              onChange={handleFileChange}
            />
            {file && (
              <button
                type="button"
                onClick={clearFileSelection}
                className="ml-2 text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full p-4 text-xl text-white transition-colors duration-300 rounded-md shadow-md bg-brand-purple hover:bg-gray-700"
        >
          Submit Ticket
        </button>
      </form>
    </main>
  );
};

export default NewTicket;
