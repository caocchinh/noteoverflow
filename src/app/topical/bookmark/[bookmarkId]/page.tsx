import Loader from "@/components/Loader/Loader";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import { userBookmarkList, userBookmarks } from "@/drizzle/schema";
import { SelectedPublickBookmark } from "@/features/topical/constants/types";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { BookmarkView } from ".";
import { Metadata } from "next";

type Params = Promise<{ bookmarkId: string }>;
export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Bookmark tricky questions and track your progress.",
};

const BookmarkViewPage = async (props: { params: Params }) => {
  try {
    const params = await props.params;
    const bookmarkId = params.bookmarkId;
    const session = await verifySession();

    const db = await getDbAsync();
    const bookmarkList = await db.query.userBookmarkList.findFirst({
      where: eq(userBookmarkList.id, bookmarkId),
      with: {
        user: {
          columns: {
            name: true,
            id: true,
            selectedImage: true,
          },
        },
      },
    });

    if (!bookmarkList) {
      return (
        <div className="pt-16 text-center text-md font-bold text-red-500 relative h-screen">
          The list that you are looking for do not exist!
        </div>
      );
    }

    const isThisBookmarkListPrivate = bookmarkList.visibility === "private";

    if (isThisBookmarkListPrivate && !session) {
      return (
        <div className="pt-16 text-center text-md font-bold text-red-500 relative h-screen">
          You are not authorized to view this list!
        </div>
      );
    }

    if (isThisBookmarkListPrivate && session?.user.id !== bookmarkList.userId) {
      return (
        <div className="pt-16 text-center text-md font-bold text-red-500 relative h-screen">
          This list is kept private. You are not authorized to view this list!
        </div>
      );
    }

    const selectedBookmarkQuestions = await db.query.userBookmarks.findMany({
      where: eq(userBookmarks.listId, bookmarkId),
      columns: { updatedAt: true },
      with: {
        question: {
          columns: {
            id: true,
            year: true,
            season: true,
            paperType: true,
            paperVariant: true,
            answers: true,
            questionImages: true,
            topics: true,
          },
        },
      },
    });

    const data: SelectedPublickBookmark[] = selectedBookmarkQuestions.map(
      (item) => {
        return {
          updatedAt: item.updatedAt,
          questionId: item.question.id,

          question: {
            ...item.question,
            questionImages: JSON.parse(item.question.questionImages ?? "[]"),
            answers: JSON.parse(item.question.answers ?? "[]"),
            topics: JSON.parse(item.question.topics ?? "[]"),
          },
        };
      }
    );

    return (
      <Suspense fallback={<Loader />}>
        <BookmarkView
          data={data}
          BETTER_AUTH_URL={process.env.BETTER_AUTH_URL}
          listId={bookmarkId}
          ownerInfo={{
            ownerId: bookmarkList.user.id,
            ownerName: bookmarkList.user.name,
            listName: bookmarkList.listName,
            ownerAvatar:
              bookmarkList.user.selectedImage ?? "/assets/avatar/blue.webp",
          }}
        />
      </Suspense>
    );
  } catch {
    return (
      <div className="pt-16 text-center text-md font-bold text-red-500 relative h-screen">
        Something went wrong while fetching resources, please refresh the page!
      </div>
    );
  }
};

export default BookmarkViewPage;
