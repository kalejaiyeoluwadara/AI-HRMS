"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Oval } from "react-loader-spinner";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const role = (session.user as { role?: string })?.role;
    if (role === "superadmin") {
      router.push("/dashboard/superadmin");
    } else if (role === "admin") {
      router.push("/dashboard/admin");
    } else if (role === "payroll_officer") {
      router.push("/dashboard/payroll");
    } else {
      router.push("/dashboard/employee");
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Oval
          color="hsl(var(--primary))"
          secondaryColor="hsl(var(--secondary))"
          height={40}
          width={40}
          ariaLabel="oval-loading"
        />
      </div>
    </div>
  );
}
