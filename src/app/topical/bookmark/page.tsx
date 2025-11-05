import BookmarkClient from "./index";

export default async function TopicalPage() {
  return <BookmarkClient BETTER_AUTH_URL="https://noteoverflow.com" />;
  // Temporary fix
}
