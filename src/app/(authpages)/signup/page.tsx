"use client";

import React, { FormEvent, useState } from "react";
import Header from "../../components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotMatchingPasswordsError } from "../../errors/errors";
import { initializeCourses } from "../../db/firebase";
import tooltipGif from "../../../../public/tooltip.gif";
import Image from "next/image";

type Role = "student" | "professor";

const SignupPage = () => {
  const router = useRouter();

  // user data
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState<string>("");
  const [canvasToken, setCanvasToken] = useState<string>("");
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [key, setKey] = useState<string>("");

  // upon clicking 'signup' button...
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Password match
    if (password !== confirmPassword) {
      alert(new NotMatchingPasswordsError().message);
      return;
    }

    const userData = {
      role: role,
      email: email,
      canvasToken: canvasToken,
      studentNumber: studentNumber,
      password: password,
      confirmPassword: confirmPassword,
      key: key,
    };

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      // Alerts user failure
      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
        throw Error(data.message);
      }

      // Successful signup
      alert(data.message);
      router.push("/");
    } catch (error) {
      console.log(`Error: ${error}`);
    }

    try {
      const response = await fetch("/api/courses", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Problem fetching courses - ${response.statusText}`);
      }

      const data = await response.json();
      await initializeCourses(data);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  return (
    <main className="flex flex-col w-screen h-screen">
      {/* Header */}
      <Header>
        {/* Title */}
        <div className="flex items-center justify-center h-full">
          <h1 className="font-bold text-white" style={{ fontSize: "2.5vw" }}>
            NUS Adminify
          </h1>
        </div>

        {/* Nav Links */}
        <div className="absolute bottom-0 right-0 flex flex-row mb-4 mr-4 space-x-4">
          <Link className="text-xl font-light text-white" href="/login">
            Log In
          </Link>
          <Link
            className="text-xl font-bold text-white underline"
            href="/signup"
          >
            Sign Up
          </Link>
        </div>
      </Header>

      {/* Contents */}
      <div className="flex justify-center flex-grow">
        {/* Grey box */}
        <div className="flex flex-col bg-[#EAEAEA] w-1/2 h-full px-48 py-16">
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            {/* Role select */}
            <div>
              <label htmlFor="role_select" className="text-2xl">
                I am a...
              </label>
              <div className="flex flex-row space-x-4">
                <button
                  className={`w-1/3 h-16 text-xl rounded-2xl 
                  ${
                    role === "student"
                      ? "bg-brand-orange font-normal border border-black"
                      : "bg-brand-orange/50 font-extralight"
                  }`}
                  type="button"
                  onClick={() => setRole("student")}
                >
                  Student
                </button>
                <button
                  className={`w-1/3 h-16 text-xl rounded-2xl
               ${
                 role === "professor"
                   ? "bg-brand-orange font-normal border border-black"
                   : "bg-brand-orange/50 font-extralight"
               }`}
                  type="button"
                  onClick={() => setRole("professor")}
                >
                  Professor
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="text-2xl">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="p-2 text-lg border border-black"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Canvas Token */}
            <div className="flex flex-col">
              {/* Label + Tooltip */}
              <div className="flex flex-row">
                {/* Label */}
                <label htmlFor="canvasToken" className="text-2xl">
                  API Token from Canvas
                </label>

                {/* Tooltip */}
                <div className="relative flex group">
                  <span className="px-2 py-1 ml-2 text-white rounded-md bg-brand-orange">
                    ?
                  </span>
                  <span className="absolute flex items-center justify-center p-4 ml-2 text-sm text-gray-100 transition-opacity duration-300 ease-in-out bg-gray-800 rounded-md opacity-0 w-[600px] h-[310px] group-hover:opacity-100 left-full">
                    <Image
                      unoptimized
                      src={tooltipGif}
                      alt="GIF Tutorial"
                      width={600}
                      height={310}
                    />
                  </span>
                </div>
              </div>

              {/* Input box */}
              <input
                type="text"
                id="canvasToken"
                name="canvasToken"
                className="p-2 text-lg border border-black"
                onChange={(e) => setCanvasToken(e.target.value)}
              />
            </div>

            {/* Student Number */}
            {
              <div
                className={`${
                  role === "student" ? "" : "hidden"
                } flex flex-col`}
              >
                <label htmlFor="studentNumber" className="text-2xl">
                  Student Number
                </label>
                <input
                  type="text"
                  id="studentNumber"
                  name="studentNumber"
                  className="p-2 text-lg border border-black"
                  onChange={(e) => setStudentNumber(e.target.value)}
                />
              </div>
            }

            {/* Key */}
            {
              <div
                className={`${
                  role === "professor" ? "" : "hidden"
                } flex flex-col`}
              >
                <label htmlFor="key" className="text-2xl">
                  Key
                </label>
                <input
                  type="password"
                  id="key"
                  name="key"
                  className="p-2 text-lg border border-black"
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>
            }

            {/* Password */}
            <div className="flex flex-col">
              <label htmlFor="password" className="text-2xl">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="p-2 text-lg border border-black"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col">
              <label htmlFor="confirm_password" className="text-2xl">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                className="p-2 text-lg border border-black"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="h-16 text-2xl text-white border border-black bg-brand-purple rounded-2xl"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SignupPage;
