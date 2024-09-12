import Link from "next/link";
import React from "react";

const Settings = () => {
  return (
    <main className="flex flex-col flex-1 ml-8">
      <h1 className="mt-8 text-3xl font-bold">Settings</h1>
      <Link
        href="/settings/change-password"
        className="flex items-center justify-center h-12 mt-6 text-center text-white bg-brand-purple w-36"
      >
        Change Password
      </Link>
      <Link
        href="/settings/change-token"
        className="flex items-center justify-center h-12 mt-6 text-center text-white bg-brand-purple w-36"
      >
        Change Token
      </Link>
    </main>
  );
};

export default Settings;
