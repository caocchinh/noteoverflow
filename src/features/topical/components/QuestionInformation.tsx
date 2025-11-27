import { Badge } from "@/components/ui/badge";
import { SelectedQuestion } from "@/features/topical/constants/types";
import {
  extractCurriculumCode,
  extractQuestionNumber,
  extractSubjectCode,
} from "../lib/utils";
import { memo } from "react";

export const QuestionInformation = memo(
  ({
    question,
    showCurriculumn,
    showSubject,
  }: {
    question: SelectedQuestion | undefined;
    showCurriculumn: boolean;
    showSubject: boolean;
  }) => {
    if (!question) {
      return null;
    }

    const temporaryFix = (item: string) => {
      if (item === "Winter") {
        return "Winter - O/N";
      } else if (item === "Summer") {
        return "Summer - M/J";
      } else if (item === "Spring") {
        return "Spring - F/M";
      }
    };

    return (
      <div className="flex flex-row flex-wrap w-full mb-3 gap-2 justify-start items-start">
        {showCurriculumn && (
          <Badge className="bg-green-600 text-white">
            {extractCurriculumCode({ questionId: question.id })}
          </Badge>
        )}
        {showSubject && (
          <Badge className="bg-green-600 text-white">
            {extractSubjectCode({ questionId: question.id })}
          </Badge>
        )}
        {question.topics?.map((topic) => (
          <Badge key={topic} className="bg-logo-main text-white">
            {topic}
          </Badge>
        ))}
        <Badge>{temporaryFix(question.season) ?? question.season}</Badge>
        <Badge>{question.year}</Badge>
        <Badge>Paper {question.paperType}</Badge>
        <Badge>
          Question {extractQuestionNumber({ questionId: question.id })}
        </Badge>
      </div>
    );
  }
);

QuestionInformation.displayName = "QuestionInformation";
