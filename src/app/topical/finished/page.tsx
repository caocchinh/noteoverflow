import FinishedQuestionsClient from "./index";

export default async function TopicalPage() {
  return (
    <FinishedQuestionsClient BETTER_AUTH_URL="https://noteoverflow.com" />
    // Temporary fix
  );
}
