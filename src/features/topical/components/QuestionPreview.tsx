import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton";
import { InferSelectModel } from "drizzle-orm";
import { userBookmarks } from "@/drizzle/schema";
import { SelectedQuestion } from "../server/actions";
import Image from "next/image";

const QuestionPreview = ({
  question,
  bookmarks,
  isBookmarksPending,
}: {
  question: SelectedQuestion;
  bookmarks: InferSelectModel<typeof userBookmarks>[];
  isBookmarksPending: boolean;
}) => {
  return question.questionImages.map((image) => (
    <div
      key={image.imageSrc}
      className="w-full h-full object-cover relative bg-white flex items-center justify-center group overflow-hidden cursor-pointer hover:scale-[0.98] transition-all group duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-sm border dark:border-transparent border-black/50 min-h-[75px] "
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0  group-hover:opacity-[37%]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-transparent opacity-0 group-hover:opacity-[100%] flex flex-wrap gap-2 items-center justify-center content-center">
        <Badge className="h-max bg-white !text-black ">{question.topic}</Badge>
        <Badge className="h-max bg-white !text-black">{question.year}</Badge>
        <Badge className="h-max bg-white !text-black">{question.season}</Badge>
        <Badge className="h-max bg-white !text-black">
          Paper {question.paperType}
        </Badge>
        <BookmarkButton
          className="absolute bottom-1 right-1 h-7 w-7 md:flex hidden cursor-pointer"
          bookmarks={bookmarks?.data || []}
          questionId={image.questionId}
          isBookmarksFetching={isBookmarksPending}
        />
      </div>
      <BookmarkButton
        className="absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer"
        bookmarks={bookmarks?.data || []}
        questionId={image.questionId}
        isBookmarksFetching={isBookmarksPending}
      />
      <Image
        className="w-full h-full object-contain"
        src={image.imageSrc}
        height={100}
        width={100}
        alt={image.imageSrc}
      />
    </div>
  ));
};

export default QuestionPreview;
