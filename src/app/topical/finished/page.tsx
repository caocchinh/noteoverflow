import FinishedQuestionsClient from "./index";

export default async function TopicalPage() {
  return (
    <FinishedQuestionsClient BETTER_AUTH_URL={process.env.BETTER_AUTH_URL} />
  );
}
