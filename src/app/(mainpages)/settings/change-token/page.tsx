"use client";

import { fetchCoursesAndStoreLocally } from "@/app/utils/fetch";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

const ChangeTokenPage = () => {
  const router = useRouter();
  const [newToken, setNewToken] = useState<string>("");

  // upon clicking change button
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      newToken: newToken,
    };

    try {
      // Send Request to server-side
      const response = await fetch("/api/change-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        await fetchCoursesAndStoreLocally();
        router.push("/");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Error: in POST request");
    }
  };

  return (
    <main className="flex flex-1 flex-col ml-8 items-center">
      <h1 className="font-bold text-4xl mt-12">Change Token</h1>
      <form className="flex flex-col space-y-4 mt-12" onSubmit={handleSubmit}>
        {/* New Token */}
        <div className="flex flex-col">
          <label htmlFor="new_token" className="text-2xl">
            New Token
          </label>
          <input
            id="new_token"
            name="new_token"
            className="p-2 border border-black text-lg w-96"
            onChange={(e) => setNewToken(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="text-2xl bg-brand-purple text-white border border-black rounded-2xl h-16"
        >
          Change
        </button>
      </form>
    </main>
  );
};

export default ChangeTokenPage;
