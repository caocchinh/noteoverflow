import { headers } from "next/headers";
import TestPage from "./TestPage";
import { auth } from "@/lib/auth/auth";
export default async function Home() {
  const session = await auth().api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      <TestPage email={session?.user?.email} />
    </div>
  );
}
