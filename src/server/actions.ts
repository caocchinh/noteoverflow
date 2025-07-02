/** biome-ignore-all lint/suspicious/noConsole: <Needed for debugging on the server> */
'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '@/constants/constants';
import type { ServerActionResponse } from '@/constants/types';
import { verifySession } from '@/dal/verifySession';
import { getDbAsync } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import type {
  CurriculumType,
  SubjectType,
} from '@/features/admin/content/constants/types';
import {
  validateCurriculum,
  validateSubject,
} from '@/features/admin/content/lib/utils';
import { auth } from '@/lib/auth/auth';
import { isValidQuestionId } from '@/lib/utils';
import { createAnswer } from './main/answer';
import { getCurriculum } from './main/curriculum';
import { getPaperType } from './main/paperType';
import { createQuestionImage, isQuestionExists } from './main/question';
import { getSeason } from './main/season';
import { getSubjectByCurriculum } from './main/subject';
import { getTopic } from './main/topic';
import { getYear } from './main/year';

export const updateUserAvatarAction = async (
  userId: string,
  avatar: string
) => {
  if (!(userId && avatar)) {
    throw new Error('User ID and avatar are required');
  }

  if (typeof userId !== 'string' || typeof avatar !== 'string') {
    throw new Error('User ID and avatar must be strings');
  }
  const authInstance = await auth(getDbAsync);
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  if (session.user.role !== 'admin' && session.user.role !== 'owner') {
    throw new Error('Unauthorized');
  }
  const db = await getDbAsync();
  const response = await db
    .update(user)
    .set({ image: avatar })
    .where(eq(user.id, userId));
  if (response.rowCount === 0) {
    throw new Error('User not found');
  }
};

export const getCurriculumAction = async (): Promise<
  ServerActionResponse<CurriculumType[]>
> => {
  try {
    const session = await verifySession();
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      redirect('/app');
    }
    const data = await getCurriculum();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error getting curriculum data:', error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const isQuestionExistsAction = async (
  questionId: string
): Promise<ServerActionResponse<boolean>> => {
  if (
    typeof questionId !== 'string' ||
    !questionId ||
    !isValidQuestionId(questionId)
  ) {
    return {
      success: false,
      error: BAD_REQUEST,
    };
  }
  try {
    const session = await verifySession();
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      redirect('/app');
    }
    const data = await isQuestionExists(questionId);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error checking if question exists:', error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const getSubjectByCurriculumAction = async (
  curriculumName: string
): Promise<ServerActionResponse<SubjectType[]>> => {
  if (
    typeof curriculumName !== 'string' ||
    validateCurriculum(curriculumName)
  ) {
    return {
      success: false,
      error: BAD_REQUEST,
    };
  }
  try {
    const session = await verifySession();
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      redirect('/app');
    }
    const data = await getSubjectByCurriculum(curriculumName);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error getting subject data:', error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const getSubjectInfoAction = async (
  subjectId: string
): Promise<
  ServerActionResponse<{
    topicData: string[];
    paperTypeData: number[];
    seasonData: string[];
    yearData: number[];
  }>
> => {
  if (
    typeof subjectId !== 'string' ||
    !subjectId ||
    validateSubject(subjectId)
  ) {
    return {
      success: false,
      error: BAD_REQUEST,
    };
  }
  try {
    const session = await verifySession();
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      redirect('/app');
    }
    const data = await Promise.all([
      getTopic(subjectId ?? ''),
      getPaperType(subjectId ?? ''),
      getSeason(subjectId ?? ''),
      getYear(subjectId ?? ''),
    ]);
    const [topicData, paperTypeData, seasonData, yearData] = data;
    return {
      success: true,
      data: {
        topicData,
        paperTypeData,
        seasonData,
        yearData,
      },
    };
  } catch (error) {
    console.error('Error getting subject info:', error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const createQuestionImageAction = async ({
  questionId,
  imageSrc,
  order,
}: {
  questionId: string;
  imageSrc: string;
  order: number;
}): Promise<ServerActionResponse<void>> => {
  if (
    typeof order !== 'number' ||
    typeof questionId !== 'string' ||
    typeof imageSrc !== 'string' ||
    !questionId ||
    !imageSrc ||
    order < 0 ||
    !isValidQuestionId(questionId)
  ) {
    return {
      success: false,
      error: BAD_REQUEST,
    };
  }
  try {
    const session = await verifySession();
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      redirect('/app');
    }
    await createQuestionImage({
      questionId,
      imageSrc,
      order,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error creating question image:', error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const createAnswerAction = async ({
  questionId,
  answer,
  answerOrder,
}: {
  questionId: string;
  answer: string;
  answerOrder: number;
}): Promise<ServerActionResponse<void>> => {
  if (
    typeof answerOrder !== 'number' ||
    typeof questionId !== 'string' ||
    typeof answer !== 'string' ||
    !questionId ||
    !answer ||
    answerOrder < 0 ||
    !isValidQuestionId(questionId)
  ) {
    return {
      success: false,
      error: BAD_REQUEST,
    };
  }
  try {
    const session = await verifySession();
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      redirect('/app');
    }
    await createAnswer({
      questionId,
      answer,
      answerOrder,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error creating answer:', error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};
