import { redirect } from "next/navigation";
import { verifySession } from "@/dal/verifySession";
import LegacyUploadClient from ".";

const LegacyUploadPage = async () => {
  const session = await verifySession();

  if (!session) {
    return redirect("/authentication");
  }

  if (session.user.role !== "owner" && session.user.role == "admin") {
    return redirect("/admin");
  }
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    return redirect("/app");
  }

  return <LegacyUploadClient />;
};

export default LegacyUploadPage;
