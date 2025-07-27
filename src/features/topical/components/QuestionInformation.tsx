import { Badge } from "@/components/ui/badge";
import { SelectedQuestion } from "@/features/topical/constants/types";
import {
  extractCurriculumCode,
  extractQuestionNumber,
  extractSubjectCode,
} from "../lib/utils";

export const QuestionInformation = ({
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

  return (
    <div className="flex flex-row flex-wrap w-full gap-2 justify-start items-start mb-3">
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
      <Badge>{question.season}</Badge>
      <Badge>{question.year}</Badge>
      <Badge>Paper {question.paperType}</Badge>
      <Badge>
        Question {extractQuestionNumber({ questionId: question.id })}
      </Badge>
    </div>
  );
};
