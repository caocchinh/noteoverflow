import { redirect } from "next/navigation";
import { verifySession } from "@/dal/verifySession";
import LegacyUploadIndex from ".";

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

  return <LegacyUploadIndex />;
};

export default LegacyUploadPage;
