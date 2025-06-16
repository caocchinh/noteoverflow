import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AdminPageClient from "./index";
import Loader from "@/components/Loader/Loader";

const AdminContent = async () => {
  const session = await auth().api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/authentication");
  }
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    return redirect("/app");
  }
  return <AdminPageClient />;
};

export default async function AdminPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AdminContent />
    </Suspense>
  );
}
