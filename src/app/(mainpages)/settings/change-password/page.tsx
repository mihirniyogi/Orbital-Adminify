"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

const ChangePasswordPage = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  // upon clicking change button
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword,
    };

    try {
      // Send Request to server-side
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
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
      <h1 className="font-bold text-4xl mt-12">Change Password</h1>
      <form className="flex flex-col space-y-4 mt-12" onSubmit={handleSubmit}>
        {/* Old Password */}
        <div className="flex flex-col">
          <label htmlFor="old_password" className="text-2xl">
            Old Password
          </label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            className="p-2 border border-black text-lg"
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        {/* New Password */}
        <div className="flex flex-col">
          <label htmlFor="new_password" className="text-2xl">
            New Password
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            className="p-2 border border-black text-lg"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        {/* Confirm New Password */}
        <div className="flex flex-col">
          <label htmlFor="confirm_new_password" className="text-2xl">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirm_new_password"
            name="confirm_new_password"
            className="p-2 border border-black text-lg"
            onChange={(e) => setConfirmNewPassword(e.target.value)}
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

export default ChangePasswordPage;
