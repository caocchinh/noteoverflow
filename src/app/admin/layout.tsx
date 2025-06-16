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
  return children;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex items-start justify-center pt-20 p-6">
      <Suspense fallback={<Loader />}>
        <h1 className="text-3xl font-semibold w-full text-logo-main">
          Admin Panel
        </h1>
        <AdminContent>{children}</AdminContent>
      </Suspense>
    </div>
  );
}
