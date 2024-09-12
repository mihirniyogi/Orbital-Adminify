import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  hashPass,
  passCheck,
} from "../(authpages)/bcrypt-hashing/bcrypt-hashing";
import {
  UserNotFoundError,
  WrongPasswordError,
  SamePasswordError,
  UnknownDBError,
  CanvasError,
} from "../errors/errors";
import { getStorage } from "firebase/storage";

import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

const db = getFirestore();
export const storage = getStorage();

const accountsCollectionRef = collection(db, "accounts");
const coursesCollectionRef = collection(db, "courses");

// processes document snapshot into object
export function spreadDoc(doc) {
  const docData = { ...doc.data() };
  let { hashed_password: _, ...rest } = docData;
  return { ...rest, id: doc.id, ref: doc.ref };
}

// returns course reference
export async function createCourse(courseDetails) {
  try {
    // Check if course already exists
    let courseDocRef = doc(coursesCollectionRef, `${courseDetails.id}`);
    let docSnapshot = await getDoc(courseDocRef);

    if (docSnapshot.exists()) {
      return courseDocRef;
    }

    // Create fields in document
    await setDoc(courseDocRef, {
      name: `${courseDetails.name}`,
      id: `${courseDetails.id}`,
      code: `${courseDetails.course_code}`,
    });

    return courseDocRef;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw error;
  }
}

export async function initializeCourses(courseData) {
  try {
    const studentCourseData = courseData.studentCourses;
    const TACourseData = courseData.TACourses;
    const profCourseData = courseData.profCourses;
    const email = courseData.id;

    studentCourseData.forEach((course) => {
      createCourse(course);
    });

    TACourseData.forEach((course) => {
      createCourse(course);
      // Reference to the TA in the course
      const courseTARef = doc(
        coursesCollectionRef,
        `${course.id}`,
        "TAs",
        email
      );
      setDoc(courseTARef, {
        TA: doc(accountsCollectionRef, email),
      });
    });

    // Initialise cousrses in database and assign Prof positions
    profCourseData.forEach((course) => {
      createCourse(course);
      // Reference to the professor in the course
      const courseProfRef = doc(
        coursesCollectionRef,
        `${course.id}`,
        "professors",
        email
      );
      setDoc(courseProfRef, {
        professor: doc(accountsCollectionRef, email),
      });
    });
  } catch (error) {
    throw error;
  }
}

// returns account details
export async function createStudentAccount(
  email,
  canvasToken,
  password,
  student_id
) {
  try {
    // Check if account already exists
    let accountDocRef = doc(accountsCollectionRef, email);
    let docSnapshot = await getDoc(accountDocRef);

    if (docSnapshot.exists()) {
      throw new DuplicateEntryError();
    }

    // Get user info from canvas
    const response = await fetch(
      "https://canvas.nus.edu.sg/api/v1/users/self",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${canvasToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new CanvasError(`${response.statusText}`);
    }

    const userDetails = await response.json();
    const full_name = userDetails.name;

    // Hash password
    const hashed_password = await hashPass(password);

    // Create fields in document
    await setDoc(accountDocRef, {
      full_name: `${full_name}`,
      canvasToken: `${canvasToken}`,
      is_lecturer: false,
      student_id: `${student_id}`,
      hashed_password: `${hashed_password}`,
    });

    // Get document
    docSnapshot = await getDoc(accountDocRef);

    // Return account details
    return spreadDoc(docSnapshot);
  } catch (error) {
    if (error instanceof CanvasError || error instanceof DuplicateEntryError) {
      throw error;
    }
    throw error;
  }
}

// returns account details
export async function createLecturerAccount(email, canvasToken, password) {
  try {
    // Check if account already exists
    let accountDocRef = doc(accountsCollectionRef, email);
    let docSnapshot = await getDoc(accountDocRef);

    if (docSnapshot.exists()) {
      throw new DuplicateEntryError();
    }

    // Get user info from canvas
    const response = await fetch(
      "https://canvas.nus.edu.sg/api/v1/users/self",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${canvasToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new CanvasError(`${response.statusText}`);
    }

    const userDetails = await response.json();
    const full_name = userDetails.name;

    // Hash password
    const hashed_password = await hashPass(password);

    // Create fields in document
    await setDoc(accountDocRef, {
      full_name: `${full_name}`,
      canvasToken: `${canvasToken}`,
      is_lecturer: true,
      student_id: "",
      hashed_password: `${hashed_password}`,
    });

    // Get document
    docSnapshot = await getDoc(accountDocRef);

    // Return account details
    return spreadDoc(docSnapshot);
  } catch (error) {
    if (error instanceof CanvasError || error instanceof DuplicateEntryError) {
      throw error;
    }
    throw error;
  }
}

// returns account object
export async function login(email, password) {
  try {
    let accountDocRef = doc(accountsCollectionRef, email);
    let docSnapshot = await getDoc(accountDocRef);

    // Account check
    if (!docSnapshot.exists()) {
      throw new UserNotFoundError();
    }

    const hashed_password = docSnapshot.data().hashed_password;
    const account = spreadDoc(docSnapshot);

    // Password check
    const check = await passCheck(password, hashed_password);
    if (!check) {
      throw new WrongPasswordError();
    }

    return account;
  } catch (error) {
    throw error;
  }
}

// Same function as login() but returns boolean
export async function passCheckDB(email, password) {
  // Get user from database
  try {
    let accountDocRef = doc(accountsCollectionRef, email);
    let docSnapshot = await getDoc(accountDocRef);

    // Account check
    if (!docSnapshot.exists()) {
      throw new UserNotFoundError();
    }

    const hashed_password = docSnapshot.data().hashed_password;

    const check = await passCheck(password, hashed_password);

    return check;
  } catch (error) {
    throw error;
  }
}

export async function updatePassword(email, newPassword) {
  try {
    // Get user from database
    let accountDocRef = doc(accountsCollectionRef, email);
    let docSnapshot = await getDoc(accountDocRef);

    // Account check
    if (!docSnapshot.exists()) {
      throw new UserNotFoundError();
    }

    const oldHashed_password = docSnapshot.data().hashed_password;

    // Check if existing password is the same
    const check = await passCheck(newPassword, oldHashed_password);
    if (check) {
      throw new SamePasswordError();
    }

    // Hash new password
    const hashed_password = await hashPass(newPassword);

    // Update new password
    await updateDoc(accountDocRef, {
      hashed_password: `${hashed_password}`,
    });
  } catch (error) {
    throw error;
  }
}

export async function updateToken(email, newToken) {
  try {
    // Get user from database
    let accountDocRef = doc(accountsCollectionRef, email);
    let docSnapshot = await getDoc(accountDocRef);

    // Account check
    if (!docSnapshot.exists()) {
      throw new UserNotFoundError();
    }

    // Check if new token is valid
    const response = await fetch(
      "https://canvas.nus.edu.sg/api/v1/users/self",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new CanvasError(`${response.statusText}`);
    }

    // Update new token
    await updateDoc(accountDocRef, {
      canvasToken: `${newToken}`,
    });
  } catch (error) {
    throw error;
  }
}

// returns user object by email(document.id) (Use cookies instead of this if possible)
export async function getUserInfo(email) {
  try {
    // Get user from database
    let docRef = doc(accountsCollectionRef, email);
    let docSnapshot = await getDoc(docRef);

    // Account check
    if (!docSnapshot.exists()) {
      throw new UserNotFoundError();
    }

    return spreadDoc(docSnapshot);
  } catch (error) {
    throw error;
  }
}

// returns user object by ref
export async function getUserInfoByRef(accountRef) {
  try {
    // Get user from database
    let docSnapshot = await getDoc(accountRef);

    // Account check
    if (!docSnapshot.exists()) {
      throw new UserNotFoundError();
    }

    return spreadDoc(docSnapshot);
  } catch (error) {
    throw error;
  }
}

// returns ticket object
export async function createNewTicket(
  courseId,
  reason,
  description,
  assignedId,
  status,
  studentEmail
) {
  try {
    const collectionRef = collection(
      coursesCollectionRef,
      `${courseId}`,
      "tickets"
    );
    const newTicketRef = doc(collectionRef);
    const studentRef = doc(accountsCollectionRef, studentEmail);

    // insert into tickets collection
    await setDoc(newTicketRef, {
      courseId: `${courseId}`,
      reason: `${reason}`,
      description: `${description}`,
      status: `${status}`,
      account_id: studentEmail,
      timestamp: new Date().getTime(),
    });
    const docSnapshot = await getDoc(newTicketRef);

    if (assignedId) {
      const assignedRef = doc(accountsCollectionRef, assignedId);
      const assignedAccount = await getUserInfoByRef(assignedRef);
      if (assignedAccount.is_lecturer) {
        // Reference to the professor in the ticket
        const profTicketRef = doc(
          collectionRef,
          docSnapshot.id,
          "professors",
          assignedAccount.id
        );
        await setDoc(profTicketRef, {
          professor: doc(accountsCollectionRef, assignedAccount.id),
        });
        // Reference to the ticket in the professor's account
        const ticketProfRef = doc(assignedRef, "tickets", docSnapshot.id);
        await setDoc(ticketProfRef, {
          ticket: doc(collectionRef, docSnapshot.id),
        });
      } else {
        // Reference to the TA in the ticket
        const TATicketRef = doc(
          collectionRef,
          docSnapshot.id,
          "TAs",
          assignedAccount.id
        );
        await setDoc(TATicketRef, {
          TA: doc(accountsCollectionRef, assignedAccount.id),
        });
        // Reference to the ticket in the TA's account
        const TicketTARef = doc(assignedRef, "TA_tickets", docSnapshot.id);
        await setDoc(TicketTARef, {
          ticket: doc(collectionRef, docSnapshot.id),
        });
      }
    }

    // Reference to the ticket in the student's account
    const studentTicketRef = doc(studentRef, "tickets", docSnapshot.id);
    await setDoc(studentTicketRef, {
      ticket: doc(collectionRef, docSnapshot.id),
    });

    return spreadDoc(docSnapshot);
  } catch (error) {
    //TODO: throw some error if didn't work
    throw error;
  }
}

// returns a list of professor account objects
export async function getProfessors(courseId) {
  try {
    let collectionRef = collection(
      coursesCollectionRef,
      `${courseId}`,
      "professors"
    );
    let docSnapshot = await getDocs(collectionRef);

    // Might be unnecessary assuming doc.getDocs() returns an empty array if collection does not exists
    if (docSnapshot.length === 0) {
      return [];
    }

    let profList = [];
    let profListRef = [];
    docSnapshot.docs.forEach((snapshot) => {
      profListRef.push(spreadDoc(snapshot));
    });

    // For loop required to await for each getDoc as it is async aware
    for (let prof of profListRef) {
      profList.push(spreadDoc(await getDoc(prof.professor)));
    }

    return profList;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw error;
  }
}

// returns a list of student account objects who are also TAs
export async function getTAs(courseId) {
  try {
    let collectionRef = collection(coursesCollectionRef, `${courseId}`, "TAs");
    let docSnapshot = await getDocs(collectionRef);

    // Might be unnecessary assuming doc.getDocs() returns an empty array if collection does not exists
    if (docSnapshot.length === 0) {
      return [];
    }

    let TAList = [];
    let TAListRef = [];
    docSnapshot.docs.forEach((snapshot) => {
      TAListRef.push(spreadDoc(snapshot));
    });

    // For loop required to await for each getDoc as it is async aware
    for (let TA of TAListRef) {
      TAList.push(spreadDoc(await getDoc(TA.TA)));
    }

    return TAList;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw new UnknownDBError();
  }
}

// returns a list of ticket objects using accountID (email)
// will work for both student and professors
export async function getTickets(email) {
  try {
    let accountRef = doc(accountsCollectionRef, email);
    let collectionRef = collection(accountRef, "tickets");
    let docSnapshot = await getDocs(collectionRef);

    // Might be unnecessary assuming doc.getDocs() returns an empty array if collection does not exists
    if (docSnapshot.length === 0) {
      return [];
    }

    let tickets = [];
    let ticketRef = [];
    docSnapshot.forEach((snapshot) => {
      ticketRef.push(spreadDoc(snapshot));
    });

    // For loop required to await for each getDoc as it is async aware
    for (let ticket of ticketRef) {
      tickets.push(spreadDoc(await getDoc(ticket.ticket)));
    }

    return tickets;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw error;
  }
}

// returns a list of TA tickets objects using accountID (email)
export async function getTATickets(email) {
  try {
    let collectionRef = collection(accountsCollectionRef, email, "TA_tickets");
    let docSnapshot = await getDocs(collectionRef);

    // Might be unnecessary assuming doc.getDocs() returns an empty array if collection does not exists
    if (docSnapshot.length === 0) {
      return [];
    }

    let tickets = [];
    let ticketRef = [];
    docSnapshot.forEach((snapshot) => {
      ticketRef.push(spreadDoc(snapshot));
    });

    // For loop required to await for each getDoc as it is async aware
    for (let ticket of ticketRef) {
      tickets.push(spreadDoc(await getDoc(ticket.ticket)));
    }

    return tickets;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw error;
  }
}

// returns a course specific list of ticket objects associated using accountRef
export async function getStudentCourseTickets(accountId, courseId) {
  try {
    const collectionRef = collection(
      coursesCollectionRef,
      `${courseId}`,
      "tickets"
    );
    const querySnapshot = await query(
      collectionRef,
      where("account_id", "==", accountId)
    );
    const docSnapshot = await getDocs(querySnapshot);

    // Might be unnecessary assuming doc.getDocs() returns an empty array if collection does not exists
    if (docSnapshot.length === 0) {
      return [];
    }

    let tickets = [];
    docSnapshot.forEach((doc) => {
      if (doc.data().courseId === courseId) {
        tickets.push(spreadDoc(doc));
      }
    });

    return tickets;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw error;
  }
}

// returns a course specific list of ticket objects associated using accountRef
export async function getTACourseTickets(accountId, courseId) {
  try {
    let collectionRef = collection(
      accountsCollectionRef,
      accountId,
      "TA_tickets"
    );
    let docSnapshot = await getDocs(collectionRef);

    // Might be unnecessary assuming doc.getDocs() returns an empty array if collection does not exists
    if (docSnapshot.length === 0) {
      return [];
    }

    let tickets = [];
    let ticketRef = [];
    docSnapshot.forEach((snapshot) => {
      ticketRef.push(spreadDoc(snapshot));
    });

    // For loop required to await for each getDoc as it is async aware
    for (let ticket of ticketRef) {
      let ticketSnapshot = spreadDoc(await getDoc(ticket.ticket));
      if (ticketSnapshot.courseId === courseId) {
        tickets.push(ticketSnapshot);
      }
    }

    return tickets;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw new UnknownDBError();
  }
}

// returns a course specific list of ticket objects associated using accountRef
export async function getProfCourseTickets(accountId, courseId) {
  try {
    let collectionRef = collection(accountsCollectionRef, accountId, "tickets");
    let docSnapshot = await getDocs(collectionRef);

    // Might be unnecessary assuming doc.getDocs() returns an empty array if collection does not exists
    if (docSnapshot.length === 0) {
      return [];
    }

    let tickets = [];
    let ticketRef = [];
    docSnapshot.forEach((snapshot) => {
      ticketRef.push(spreadDoc(snapshot));
    });

    // For loop required to await for each getDoc as it is async aware
    for (let ticket of ticketRef) {
      let ticketSnapshot = spreadDoc(await getDoc(ticket.ticket));
      if (ticketSnapshot.courseId === courseId) {
        tickets.push(ticketSnapshot);
      }
    }

    return tickets;
  } catch (error) {
    //TODO: throw some error if didn't work
    throw new UnknownDBError();
  }
}

// returns course obj, given the course id
export async function getCourseInfoFromId(courseId) {
  try {
    const courseRef = doc(coursesCollectionRef, courseId);
    const courseSnapshot = await getDoc(courseRef);
    const courseData = spreadDoc(courseSnapshot);
    return courseData;
  } catch (error) {
    throw error;
  }
}

// returns newly modified ticket obj
export async function modifyTicket(courseId, ticketId, replyString) {
  try {
    const ticketRef = doc(
      coursesCollectionRef,
      `${courseId}`,
      "tickets",
      `${ticketId}`
    );
    const ticketSnapshot = await getDoc(ticketRef);
    if (!ticketSnapshot.exists()) {
      throw new Error("Ticket not found");
    }

    const updates = {
      reply: replyString,
      status: "Closed",
    };

    await updateDoc(ticketRef, updates);

    // Retrieve ticket details
    const updatedTicketSnapshot = await getDoc(ticketRef);
    const updatedTicketDetails = spreadDoc(updatedTicketSnapshot);

    return updatedTicketDetails;
  } catch (error) {
    throw error;
  }
}

export async function getProfessorFromTicket(courseId, ticketId) {
  try {
    const ticketRef = doc(
      coursesCollectionRef,
      `${courseId}`,
      "tickets",
      `${ticketId}`
    );

    const ticketSnapshot = await getDoc(ticketRef);
    if (!ticketSnapshot.exists()) {
      throw new Error("Ticket not found");
    }

    const professorsCollectionRef = collection(ticketRef, "professors");
    const professorSnapshot = await getDocs(professorsCollectionRef);

    if (professorSnapshot.empty) {
      throw new Error("No professor documents found");
    }

    const professorDoc = professorSnapshot.docs[0];

    const professorData = professorDoc.data();
    const professorRef = professorData.professor;

    const professorDetailDoc = await getDoc(professorRef);

    if (!professorDetailDoc.exists()) {
      throw new Error("Referenced professor document not found");
    }

    const professorDetailData = professorDetailDoc.data();
    return professorDetailData;
  } catch (error) {
    throw error;
  }
}
