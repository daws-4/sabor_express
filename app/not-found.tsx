"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
    </div>
  );
}
