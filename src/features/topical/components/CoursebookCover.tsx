import { TopicalSubject, ValidCurriculum } from "@/constants/types";
import { BookMarked, CalendarOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { default as NextImage } from "next/image";
import { memo } from "react";

const CoursebookCover = memo(
  ({
    selectedSubject,
    selectedCurriculum,
    availableSubjects,
    subjectSyllabus,
  }: {
    selectedSubject: string;
    selectedCurriculum: ValidCurriculum;
    availableSubjects: TopicalSubject[];
    subjectSyllabus: string | undefined;
  }) => {
    return (
      <AnimatePresence mode="wait">
        {selectedSubject && selectedCurriculum ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            key={selectedSubject}
            transition={{
              duration: 0.15,
              ease: "easeInOut",
            }}
            className="flex flex-col gap-2"
          >
            <NextImage
              alt="cover"
              className="self-center rounded-[2px]"
              height={126}
              src={
                availableSubjects.find((item) => item.code === selectedSubject)?.coverImage ?? ""
              }
              width={100}
            />
            {subjectSyllabus ? (
              <a
                className="border-muted-foreground/20 bg-muted flex w-full flex-row items-center justify-center gap-1 rounded-md border p-1 text-sm"
                href={subjectSyllabus}
                target="_blank"
                title="Open syllabus"
                rel="noreferrer"
              >
                Syllabus
                <BookMarked size={15} />
              </a>
            ) : (
              <div className="border-muted-foreground/20 bg-muted flex w-full flex-row items-center justify-center gap-1 rounded-md border p-1 text-sm">
                Outdated
                <CalendarOff size={15} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            key={selectedSubject}
            transition={{
              duration: 0.15,
              ease: "easeInOut",
            }}
          >
            <NextImage
              alt="default subject"
              className="self-center"
              height={100}
              src="/assets/pointing.webp"
              width={100}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
CoursebookCover.displayName = "CoursebookCover";

export default CoursebookCover;
