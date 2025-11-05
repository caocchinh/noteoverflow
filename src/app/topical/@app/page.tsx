import { Metadata } from "next";
import TopicalClient from "./index";

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
