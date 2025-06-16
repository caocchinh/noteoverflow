import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loader from "@/components/Loader/Loader";

const AdminContent = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth().api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/authentication");
  }
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    return redirect("/app");
  }

  return (
    <div className="w-full flex items-start justify-center pt-20 p-6">
      <div className="flex items-start justify-center flex-col gap-2 w-full">
        <h1 className="text-3xl font-semibold w-full text-logo-main">
          Admin Panel
        </h1>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-sm text-gray-500">{session.user.email}</h3>
          <span className="text-sm text-gray-500">•</span>
          <h3 className="text-sm text-gray-500">
            {session.user.role.charAt(0).toUpperCase() +
              session.user.role.slice(1)}
          </h3>
        </div>
      </div>
      {children}
    </div>
  );
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader />}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
