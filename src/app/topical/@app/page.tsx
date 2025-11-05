import { Metadata } from "next";
import TopicalClient from "./index";

// Disable all caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Topical questions",
  description:
    "Practice curated topical questions across AS & A-level curriculums on NoteOverflow. Filter by subject, topic and year, bookmark tricky questions, and monitor your progress.",
};

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TopicalPage({ searchParams }: SearchParams) {
  return (
    <TopicalClient
      searchParams={await searchParams}
      BETTER_AUTH_URL={process.env.BETTER_AUTH_URL}
    />
  );
}
