import { Metadata } from "next";
import BookmarkClient from "./index";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Bookmark questions and track your progress.",
};

export default async function TopicalPage() {
  return <BookmarkClient BETTER_AUTH_URL="https://noteoverflow.com" />;
  // Temporary fix
}
