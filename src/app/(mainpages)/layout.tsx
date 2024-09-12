"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "../context/UserContext";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUserInfo } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // authenticate user + get the user info + set context for user info
    async function getUserInfoAndSetContext() {
      try {
        const response = await fetch("/api/userinfo", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          router.push("/login");
          throw Error("Unauthenticated");
        }

        const data = await response.json();
        const accountDetails = data.message;

        // sets user's info in global context
        setUserInfo({
          name: accountDetails.full_name,
          role: accountDetails.is_lecturer ? "Professor" : "Student",
        });
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    }
    getUserInfoAndSetContext();
  }, [pathname, router, setUserInfo]);

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={`flex-1 transition-margin duration-300 mb-8 ${
          isSidebarOpen ? "ml-[10%]" : "ml-[5%]"
        }`}
      >
        {children}
      </div>
    </>
  );
}
