"use client";

import React, { FormEvent, useState } from "react";
import Header from "../../components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  fetchCoursesAndStoreLocally,
  fetchTATicketsAndStoreLocally,
  fetchTicketsAndStoreLocally,
} from "../../utils/fetch";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  // upon clicking login button
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      // Alerts user of failure
      if (!response.ok) {
        setLoading(false);
        alert(data.message);
        throw Error(data.message);
      }

      // Successful login
      await fetchCoursesAndStoreLocally();
      await fetchTicketsAndStoreLocally();
      await fetchTATicketsAndStoreLocally();
      router.push("/");
    } catch (error) {
      setLoading(false);
      console.log(`Error: ${error}`);
    }
  };

  return (
    <main className="flex flex-col w-screen h-screen">
      {/* Loading Indicator */}
      {loading && <LoadingSpinner />}

      {/* Header */}
      <Header>
        {/* Title */}
        <div className="flex h-full justify-center items-center">
          <h1 className="text-white font-bold" style={{ fontSize: "2.5vw" }}>
            NUS Adminify
          </h1>
        </div>

        {/* Nav Links */}
        <div className="flex flex-row absolute bottom-0 right-0 mr-4 space-x-4 mb-4">
          <Link
            className="text-white font-bold underline text-xl"
            href="/login"
          >
            Log In
          </Link>
          <Link className="text-white font-light text-xl" href="/signup">
            Sign Up
          </Link>
        </div>
      </Header>

      {/* Contents */}
      <div className="flex flex-grow justify-center">
        {/* Grey box */}
        <div className="flex flex-col bg-[#EAEAEA] w-1/2 h-full px-48 py-16">
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            {/* Welcome title */}
            <h2 className="text-5xl text-center">Welcome</h2>

            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="text-2xl">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="p-2 border border-black text-lg"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label htmlFor="password" className="text-2xl">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="p-2 border border-black text-lg"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="text-2xl bg-brand-purple text-white border border-black rounded-2xl h-16"
              disabled={loading}
            >
              Log In
            </button>

            <Link
              className="text-2xl text-black border h-16"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
