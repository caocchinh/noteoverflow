import { Metadata } from "next";
import FinishedQuestionsClient from "./index";

export const metadata: Metadata = {
  title: "Finished questions",
  description: "Track your progress and monitor your performance.",
};

export default async function TopicalPage() {
  return (
    <FinishedQuestionsClient BETTER_AUTH_URL="https://noteoverflow.com" />
    // Temporary fix
  );
}
