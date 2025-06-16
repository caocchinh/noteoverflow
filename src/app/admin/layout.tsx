import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loader from "@/components/Loader/Loader";
import Navigation from "@/features/admin/components/Navigation";

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
    <div className="w-full flex items-start justify-center pt-20 p-6 flex-col">
      <div className="flex items-start md:items-center justify-start w-full border-b border-gray-600 pb-4 flex-col md:flex-row gap-4 md:gap-10">
        <div className="flex items-start justify-center flex-col gap-2 w-max">
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
        <div className="h-[35px] border-l border-gray-500 w-[1px] hidden md:block"></div>
        {session && <Navigation isOwner={session.user.role === "owner"} />}
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
