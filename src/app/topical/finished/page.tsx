import FinishedQuestionsClient from "./index";

// Force dynamic rendering to prevent parallel route caching conflicts
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TopicalPage() {
  return (
    <FinishedQuestionsClient BETTER_AUTH_URL="https://noteoverflow.com" />
    // Temporary fix I'm too tired for this shit
  );
}
