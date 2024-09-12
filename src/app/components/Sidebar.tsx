"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  FiMenu,
  FiChevronsLeft,
  FiSliders,
  FiLayers,
  FiClipboard,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { useAppContext } from "../context/UserContext";

const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const { userInfo } = useAppContext();

  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      // clear local storage
      localStorage.clear();

      router.push("/login");
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  const links = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiSliders className="text-brand-orange" size={24} />,
      link: "/dashboard",
    },
    {
      id: "courses",
      label: "Courses",
      icon: <FiLayers className="text-brand-orange" size={24} />,
      link: "/courses",
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: <FiClipboard className="text-brand-orange" size={24} />,
      link: "/tickets",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <FiSettings className="text-brand-orange" size={24} />,
      link: "/settings",
    },
  ];

  return (
    <div
      className={`fixed flex flex-col h-screen items-center bg-sidebar text-white transition-width duration-300`}
      style={{ width: isOpen ? "10%" : "5%" }}
    >
      {/* toggle button */}
      <button onClick={toggleSidebar} className={`text-white my-6 text-2xl`}>
        {isOpen ? <FiChevronsLeft size={24} /> : <FiMenu size={24} />}
      </button>

      {/* menu */}
      <div className="flex flex-col flex-grow w-full">
        {/* for each item in the array, create a menu item */}
        {links.map((item) => (
          <div
            key={item.id}
            className={`flex items-center py-4 hover:bg-gray-700 cursor-pointer transition duration-300 ${
              isOpen ? "px-6 justify-start" : "justify-center"
            } ${pathname.includes(item.link) ? "bg-gray-700" : ""}`}
            onClick={() => router.push(item.link)}
          >
            {/* icon */}
            <span className="text-2xl">{item.icon}</span>

            {/* text */}
            <span
              className={`ml-2 ${isOpen ? "inline-block" : "hidden"} text-lg`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* role */}
      <div className="flex items-center mb-4">
        <FiUser
          className={`text-brand-orange ${
            isOpen ? "text-2xl" : "text-base"
          } transition-all duration-300`}
        />
        <span
          className={`ml-1 ${
            isOpen ? "text-lg" : "text-sm"
          } transition-all duration-300`}
        >
          {userInfo.role}
        </span>
      </div>

      {/* logout button */}
      <button
        className="justify-end w-full p-4 mb-6 bg-brand-purple hover:bg-gray-700 transition-colors duration-300"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
