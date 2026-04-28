import { cookies } from "next/headers";
import AuthRedirect from "@/components/AuthRedirect";
import { verifyAuthToken } from "@/lib/auth";

export default async function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const session = verifyAuthToken(token);

  if (!session) {
    return (
      <AuthRedirect
        message="Please log in to access the owner dashboard."
        redirectTo="/login"
      />
    );
  }

  if (session.role !== "owner") {
    return (
      <AuthRedirect
        message="You do not have access to the owner dashboard."
        redirectTo="/employee"
      />
    );
  }

  return children;
}