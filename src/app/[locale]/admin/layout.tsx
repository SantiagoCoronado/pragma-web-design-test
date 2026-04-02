import { isAuthenticated } from "@/features/auth/lib/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  if (!authed) {
    return <LoginForm />;
  }

  return <>{children}</>;
}
