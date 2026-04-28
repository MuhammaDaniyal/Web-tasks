import { cookies } from "next/headers";
import AuthRedirect from "@/components/AuthRedirect";
import { verifyAuthToken } from "@/lib/auth";

export default async function EmployeeLayout({
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
        message="Please log in to access the employee dashboard."
        redirectTo="/login"
      />
    );
  }

  if (session.role !== "employee") {
    return (
      <AuthRedirect
        message="You do not have access to the employee dashboard."
        redirectTo="/owner"
      />
    );
  }

  return children;
}