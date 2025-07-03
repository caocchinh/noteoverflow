'use server';

import { redirect } from 'next/navigation';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '@/constants/constants';
import type {
  ServerActionResponse,
  ValidContentType,
  ValidSeason,
} from '@/constants/types';
import { verifySession } from '@/dal/verifySession';
import { isValidQuestionId } from '@/lib/utils';
import { overwriteAnswer } from '@/server/main/answer';
import { createCurriculum, isCurriculumExists } from '@/server/main/curriculum';
import { createPaperType, isPaperTypeExists } from '@/server/main/paperType';
import {
  overwriteQuestion,
  overwriteQuestionImage,
} from '@/server/main/question';
import { createSeason, isSeasonExists } from '@/server/main/season';
import { createSubject, isSubjectExists } from '@/server/main/subject';
import { createTopic, isTopicExists } from '@/server/main/topic';
import { createYear, isYearExists } from '@/server/main/year';
import {
  validateCurriculum,
  validatePaperType,
  validatePaperVariant,
  validateQuestionNumber,
  validateSeason,
  validateSubject,
  validateTopic,
  validateYear,
} from '../../content/lib/utils';

export const legacyUploadAction = async ({
  curriculum,
  subjectFullName,
  year,
  season,
  paperType,
  paperVariant,
  topic,
  questionId,
  questionNumber,
  contentType,
  imageSrc,
  order,
}: {
  curriculum: string;
  subjectFullName: string;
  year: number;
  season: ValidSeason;
  paperType: number;
  paperVariant: number;
  topic: string;
  questionId: string;
  questionNumber: number;
  contentType: ValidContentType;
  imageSrc: string;
  order: number;
}): Promise<ServerActionResponse<void>> => {
  if (
    typeof curriculum !== 'string' ||
    typeof subjectFullName !== 'string' ||
    typeof year !== 'number' ||
    typeof season !== 'string' ||
    typeof paperType !== 'number' ||
    typeof paperVariant !== 'number' ||
    typeof topic !== 'string' ||
    typeof questionId !== 'string' ||
    typeof questionNumber !== 'number' ||
    typeof contentType !== 'string' ||
    typeof imageSrc !== 'string' ||
    typeof order !== 'number' ||
    !questionId ||
    !questionNumber ||
    !year ||
    !season ||
    !paperType ||
    !paperVariant ||
    !topic ||
    !contentType ||
    !imageSrc ||
    order < 0 ||
    (contentType !== 'questions' && contentType !== 'answers') ||
    validateCurriculum(curriculum) ||
    validateSubject(subjectFullName) ||
    validateYear(year.toString()) ||
    validateSeason(season) ||
    validatePaperType(paperType.toString()) ||
    validatePaperVariant(paperVariant.toString()) ||
    validateQuestionNumber(questionNumber.toString()) ||
    validateTopic(topic) ||
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
    const userId = session.user.id;
    // Check and create curriculum if needed
    if (!(await isCurriculumExists(curriculum))) {
      await createCurriculum({ name: curriculum });
    }

    // Check and create subject if needed
    if (!(await isSubjectExists(subjectFullName))) {
      await createSubject({
        id: subjectFullName,
        curriculumName: curriculum,
      });
    }
    // Check and create year, season, paperType, and topic concurrently
    await Promise.all([
      // Check and create year if needed
      (async () => {
        if (!(await isYearExists(year, subjectFullName))) {
          await createYear({
            year,
            subjectId: subjectFullName,
          });
        }
      })(),

      // Check and create season if needed
      (async () => {
        if (!(await isSeasonExists(season, subjectFullName))) {
          await createSeason({
            season,
            subjectId: subjectFullName,
          });
        }
      })(),

      // Check and create paperType if needed
      (async () => {
        if (!(await isPaperTypeExists(paperType, subjectFullName))) {
          await createPaperType({
            paperType,
            subjectId: subjectFullName,
          });
        }
      })(),

      // Check and create topic if needed
      (async () => {
        if (!(await isTopicExists(topic, subjectFullName))) {
          await createTopic({
            topic,
            subjectId: subjectFullName,
          });
        }
      })(),
    ]);

    // Create or overwrite question/answer based on content type
    if (contentType === 'questions') {
      await overwriteQuestion({
        questionId,
        year,
        season,
        paperType,
        curriculumName: curriculum,
        paperVariant,
        userId,
        subjectId: subjectFullName,
        topic,
        questionNumber,
      });

      await overwriteQuestionImage({
        questionId,
        imageSrc,
        order,
      });
    } else if (contentType === 'answers') {
      await overwriteAnswer({
        questionId,
        answer: imageSrc,
        answerOrder: order,
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <Necessary for debugging on server log>
    console.error('Legacy:: Error creating metadata records:', error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};
