"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    async function getUserInfo() {
      try {
        const response = await fetch("/api/userinfo", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        // Authenticated already? Redirect to dashboard page.
        if (response.ok) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.log(`Error: ${error}`);
        router.push("/login");
      }
    }
    getUserInfo();
  }, [pathname, router]);
  return <>{children}</>;
}
