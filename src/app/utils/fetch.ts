import {
  PROF_COURSES_KEY,
  STUDENT_COURSES_KEY,
  TATICKETS_KEY,
  TA_COURSES_KEY,
  TICKETS_KEY,
} from "../constants/constants";

// function to fetch courses
export async function fetchCoursesAndStoreLocally() {
  try {
    const response = await fetch("/api/courses", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Problem fetching courses");
    }

    const data = await response.json();

    // store locally
    localStorage.setItem(
      STUDENT_COURSES_KEY,
      JSON.stringify(data.studentCourses)
    );
    localStorage.setItem(TA_COURSES_KEY, JSON.stringify(data.TACourses));
    localStorage.setItem(PROF_COURSES_KEY, JSON.stringify(data.profCourses));
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

// function to fetch tickets + store in localStorage
export async function fetchTicketsAndStoreLocally() {
  try {
    const response = await fetch("/api/tickets", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Problem fetching courses");
    }

    const data = await response.json();

    // store locally
    localStorage.setItem(TICKETS_KEY, JSON.stringify(data.message));
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

// function to fetch TA tickets + store in localStorage
export async function fetchTATicketsAndStoreLocally() {
  try {
    const response = await fetch("/api/tatickets", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Problem fetching courses");
    }

    const data = await response.json();

    // store locally
    localStorage.setItem(TATICKETS_KEY, JSON.stringify(data.message));
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}
