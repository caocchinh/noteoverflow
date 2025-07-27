import Loader from "@/components/Loader/Loader";
import { getDbAsync } from "@/drizzle/db";
import { question as questionTable } from "@/drizzle/schema";
import { SelectedQuestion } from "@/features/topical/constants/types";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { QuestionView } from ".";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type Params = Promise<{ questionId: string }>;

const QuestionViewPage = async (props: { params: Params }) => {
  try {
    const params = await props.params;
    const questionId = params.questionId;
    const { env } = await getCloudflareContext({ async: true });
    const response = await env.TOPICAL_CACHE.get(JSON.stringify(questionId));
    let result = response ? (JSON.parse(response) as SelectedQuestion) : null;
    if (result === null) {
      const db = await getDbAsync();
      const question = await db.query.question.findFirst({
        where: eq(questionTable.id, decodeURIComponent(questionId)),
      });

      if (!question) {
        return (
          <div className="pt-16 text-center text-md font-bold text-red-500 relative h-screen">
            The question that you are looking for do not exist!
          </div>
        );
      }

      const data: SelectedQuestion = {
        ...question,
        questionImages: JSON.parse(question.questionImages ?? "[]"),
        answers: JSON.parse(question.answers ?? "[]"),
        topics: JSON.parse(question.topics ?? "[]"),
      };
      await env.TOPICAL_CACHE.put(
        JSON.stringify(decodeURIComponent(questionId)),
        JSON.stringify(data)
      );
      result = data;
    }

    return (
      <Suspense fallback={<Loader />}>
        <QuestionView
          data={result}
          BETTER_AUTH_URL={process.env.BETTER_AUTH_URL}
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

export default QuestionViewPage;
