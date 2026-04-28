"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthRedirectProps = {
  message: string;
  redirectTo: string;
};

export default function AuthRedirect({ message, redirectTo }: AuthRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    window.alert(message);
    router.replace(redirectTo);
  }, [message, redirectTo, router]);

  return null;
}