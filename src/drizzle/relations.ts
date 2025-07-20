import { relations } from "drizzle-orm";
import {
  user,
  session,
  account,
  userBookmarks,
  userBookmarkList,
  question,
  season,
  paperType,
  year,
  topic,
  subject,
  curriculum,
  questionTopic,
  finishedQuestions,
  recentQuery,
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  bookmarks: many(userBookmarks),
  bookmarkLists: many(userBookmarkList),
  finishedQuestions: many(finishedQuestions),
  recentQuestions: many(recentQuery),
}));

export const userBookmarkListRelations = relations(
  userBookmarkList,
  ({ many, one }) => ({
    userBookmarks: many(userBookmarks),
    user: one(user, {
      fields: [userBookmarkList.userId],
      references: [user.id],
    }),
  })
);

export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(user, {
    fields: [userBookmarks.userId],
    references: [user.id],
  }),
  question: one(question, {
    fields: [userBookmarks.questionId],
    references: [question.id],
  }),
  listName: one(userBookmarkList, {
    fields: [userBookmarks.listName],
    references: [userBookmarkList.listName],
  }),
}));

export const finishedQuestionsRelations = relations(
  finishedQuestions,
  ({ one }) => ({
    user: one(user, {
      fields: [finishedQuestions.userId],
      references: [user.id],
    }),
    question: one(question, {
      fields: [finishedQuestions.questionId],
      references: [question.id],
    }),
  })
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
  impersonator: one(user, {
    fields: [session.impersonatedBy],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const curriculumRelations = relations(curriculum, ({ many }) => ({
  subjects: many(subject),
  topics: many(topic),
  seasons: many(season),
  paperTypes: many(paperType),
  years: many(year),
  questions: many(question),
}));

export const subjectRelations = relations(subject, ({ many }) => ({
  curriculum: many(curriculum),
  topics: many(topic),
  questions: many(question),
  seasons: many(season),
  paperTypes: many(paperType),
  years: many(year),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  subject: one(subject, {
    fields: [question.subjectId],
    references: [subject.subjectId],
  }),

  season: one(season, {
    fields: [question.season, question.subjectId, question.curriculumName],
    references: [season.season, season.subjectId, season.curriculumName],
  }),
  paperType: one(paperType, {
    fields: [question.paperType, question.subjectId, question.curriculumName],
    references: [
      paperType.paperType,
      paperType.subjectId,
      paperType.curriculumName,
    ],
  }),
  year: one(year, {
    fields: [question.year, question.subjectId, question.curriculumName],
    references: [year.year, year.subjectId, year.curriculumName],
  }),
  questionTopics: many(questionTopic),
}));

export const questionTopicRelations = relations(questionTopic, ({ one }) => ({
  question: one(question, {
    fields: [questionTopic.questionId],
    references: [question.id],
  }),
  topic: one(topic, {
    fields: [
      questionTopic.topic,
      questionTopic.subjectId,
      questionTopic.curriculumName,
    ],
    references: [topic.topic, topic.subjectId, topic.curriculumName],
  }),
}));

export const seasonRelations = relations(season, ({ one, many }) => ({
  subject: one(subject, {
    fields: [season.subjectId],
    references: [subject.subjectId],
  }),
  curriculum: one(curriculum, {
    fields: [season.curriculumName],
    references: [curriculum.name],
  }),
  questions: many(question),
}));

export const paperTypeRelations = relations(paperType, ({ one, many }) => ({
  subject: one(subject, {
    fields: [paperType.subjectId],
    references: [subject.subjectId],
  }),
  curriculum: one(curriculum, {
    fields: [paperType.curriculumName],
    references: [curriculum.name],
  }),
  questions: many(question),
}));

export const yearRelations = relations(year, ({ one, many }) => ({
  subject: one(subject, {
    fields: [year.subjectId],
    references: [subject.subjectId],
  }),
  curriculum: one(curriculum, {
    fields: [year.curriculumName],
    references: [curriculum.name],
  }),
  questions: many(question),
}));

export const topicRelations = relations(topic, ({ one, many }) => ({
  subject: one(subject, {
    fields: [topic.subjectId],
    references: [subject.subjectId],
  }),

  curriculum: one(curriculum, {
    fields: [topic.curriculumName],
    references: [curriculum.name],
  }),
  questions: many(question),
  questionTopics: many(questionTopic),
}));

export const recentQueryRelations = relations(recentQuery, ({ one }) => ({
  user: one(user, {
    fields: [recentQuery.userId],
    references: [user.id],
  }),
}));
