import { verifySession } from "@/dal/verifySession";
import { redirect } from "next/navigation";
import ImageDimensionsClient from ".";

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

  return <ImageDimensionsClient />;
};

export default ImageDimensionsPage;
