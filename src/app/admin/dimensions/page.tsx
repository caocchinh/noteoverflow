import { redirect } from "next/navigation";
import { verifySession } from "@/dal/verifySession";
import ImageDimensionsIndex from ".";

const ImageDimensionsPage = async () => {
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

  return <ImageDimensionsIndex />;
};

export default ImageDimensionsPage;
