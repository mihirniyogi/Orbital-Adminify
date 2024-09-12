import React, { useEffect, useState } from "react";
import { Course } from "../constants/constants";

type Announcement = {
  course_code: string;
  id: number;
  title: string;
  message: string;
  author: string;
  created: Date;
  expanded: boolean;
};

const Announcements = ({
  courses,
  showCode,
  startDate,
  limit,
}: {
  courses: Course[];
  showCode: boolean;
  startDate?: Date;
  limit?: number;
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        let allAnnouncements: Announcement[] = [];

        // for each course, fetch announcements
        for (const course of courses) {
          const response = await fetch(
            `/api/canvasAnnouncement?courseId=${course.id}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error fetching announcement for course ID ${course.id}: ${response.statusText}`
            );
          }

          const responseData = await response.json();
          const announceDataFromCanvas = responseData.message;
          const announceData: Announcement[] = announceDataFromCanvas.map(
            (annObj: any) => ({
              course_code: course.code,
              id: annObj.id,
              title: annObj.title,
              message: annObj.message,
              author: annObj.user_name,
              created: new Date(annObj.posted_at),
              expanded: false,
            })
          );
          allAnnouncements.push(...announceData);
        }

        // filter announcements by start date (if any)
        // limit announcements by specified limit (if any)
        allAnnouncements = allAnnouncements
          .filter((annObj) => {
            if (startDate) {
              return annObj.created >= startDate;
            }
            return true;
          })
          .slice(0, limit || allAnnouncements.length);

        setAnnouncements(allAnnouncements);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    }

    fetchAnnouncements();
  }, [courses, limit, startDate]);

  // Function to toggle announcement expansion
  const toggleAnnouncement = (index: number) => {
    setAnnouncements((prevAnnouncements) =>
      prevAnnouncements.map((announcement, i) =>
        i === index
          ? { ...announcement, expanded: !announcement.expanded }
          : announcement
      )
    );
  };

  // Function to render HTML content safely
  const renderHTML = (htmlString: string) => {
    return { __html: htmlString };
  };

  return (
    <>
      {/* Announcements group */}
      <div className="flex-col w-full space-y-2">
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id}
            className={`relative p-4 border border-gray-300 rounded-lg`}
          >
            {/* Course Code Label */}
            {showCode && (
              <span className="absolute right-1 top-1 bg-brand-purple text-white text-sm font-medium py-1 px-2 rounded">
                {announcement.course_code}
              </span>
            )}

            {/* Title + Author + Arrow */}
            <div
              className="flex space-x-2 cursor-pointer justify-left"
              onClick={() => toggleAnnouncement(index)}
            >
              {/* Arrow */}
              <svg
                className={`w-6 h-6 transition-transform duration-300 transform ${
                  announcement.expanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>

              {/* Title + Author */}
              <div className="flex-col">
                <h3 className="text-lg font-semibold">{announcement.title}</h3>
                <h3 className="text-lg italic font-normal">
                  by {announcement.author},{" "}
                  {announcement.created.toLocaleDateString("en-SG", {
                    day: "2-digit",
                    month: "long",
                    weekday: "short",
                  })}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                announcement.expanded ? "mt-4 max-h-screen" : "max-h-0"
              }`}
              dangerouslySetInnerHTML={renderHTML(announcement.message)}
            />
          </div>
        ))}

        {/* If zero announcements, show this */}
        {announcements.length === 0 && (
          <p className="text-gray-noinfo">No announcements available.</p>
        )}
      </div>
    </>
  );
};

export default Announcements;
