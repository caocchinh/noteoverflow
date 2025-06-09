import NavBar from "@/components/NavBar/NavBar";

import type { Metadata } from "next";
import AuthPageClient from "./index";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to NoteOverflow",
};

export default function LoginPage() {
  return (
    <>
      <NavBar />
      <AuthPageClient />
    </>
  );
}
