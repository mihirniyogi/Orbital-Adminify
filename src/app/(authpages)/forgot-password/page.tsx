"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Header from "../../components/Header";
import Link from "next/link";
import { RESET_TIMER_DURATION, RESET_TIMER_KEY } from "../../constants/constants";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  // Timer variables
  const [timer, setTimer] = useState(0);
  const [disabled, setDisabled] = useState(false);

  // Function to start countdown
  const startTimer = (timeLeftInMilliseconds: number) => {
    // set the end time in local storage
    const endTime = Date.now() + timeLeftInMilliseconds;
    localStorage.setItem(RESET_TIMER_KEY, endTime.toString());

    // set timer to 30s and disable button
    setTimer(Math.ceil(timeLeftInMilliseconds / 1000));
    setDisabled(true);

    // every second, update 'timer'
    // but if timer runs out, re-enable button
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          setDisabled(false);
          localStorage.removeItem(RESET_TIMER_KEY);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    // cleanup
    return () => clearInterval(countdown);
  };

  // When component first renders, fetch timer (if it's there and valid)
  useEffect(() => {
    // fetch timer
    const endTime = localStorage.getItem(RESET_TIMER_KEY);
    if (!endTime) return;

    // calculate remaining time, in milliseconds
    const remainingTime = Math.max(0, parseInt(endTime) - Date.now());
    if (remainingTime <= 0) return;

    // if still have time left, start countdown
    const cleanup = startTimer(remainingTime);
    return cleanup;
  }, []);

  // upon clicking reset button
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      email: email,
    };

    startTimer(RESET_TIMER_DURATION);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      // Alerts user of failure
      if (!response.ok) {
        alert(data.message);
        throw Error(data.message);
      }

      // Successful reset password
      alert(data.message);
      router.push("/login");
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
          <Link
            className="text-xl font-bold text-white underline"
            href="/login"
          >
            Log In
          </Link>
          <Link className="text-xl font-light text-white" href="/signup">
            Sign Up
          </Link>
        </div>
      </Header>

      {/* Contents */}
      <div className="flex justify-center flex-grow">
        {/* Grey box */}
        <div className="flex flex-col bg-[#EAEAEA] w-1/2 h-full px-48 py-16">
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            {/* Welcome title */}
            <h2 className="text-4xl text-left">
              Enter your email to reset password
            </h2>

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

            {/* Reset */}
            <button
              type="submit"
              disabled={disabled}
              className={`text-2xl text-white border border-black rounded-2xl h-16 ${
                disabled ? "bg-gray-400" : "bg-brand-purple"
              }`}
            >
              {disabled
                ? `Wait ${timer} seconds before resetting again`
                : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
