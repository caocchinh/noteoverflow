import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").notNull().default("user"),
  banned: integer("banned", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  banReason: text("ban_reason"),
  banExpiresAt: integer("ban_expires_at", { mode: "timestamp" }),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by").references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const curriculum = sqliteTable("curriculum", {
  name: text("name").notNull().primaryKey().unique(),
});

export const subject = sqliteTable("subject", {
  name: text("name").notNull().primaryKey(),
  subjectCode: integer("subject_code").notNull().primaryKey().unique(),
  curriculumName: text("curriculum_name")
    .references(() => curriculum.name)
    .notNull(),
});

export const topic = sqliteTable("topic", {
  name: text("name").notNull().primaryKey().unique(),
  subjectCode: integer("subject_code")
    .references(() => subject.subjectCode)
    .notNull(),
  curriculumName: text("curriculum_name")
    .references(() => curriculum.name)
    .notNull(),
});

export const question = sqliteTable("question", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  season: text("season").notNull(),
  paperId: text("paper_id").notNull(),
  subjectCode: integer("subject_code")
    .references(() => subject.subjectCode)
    .notNull(),
  topicName: text("topic_name")
    .references(() => topic.name)
    .notNull(),
  curriculumName: text("curriculum_name")
    .references(() => curriculum.name)
    .notNull(),
  questionNumber: integer("question_number").notNull(),
  questionOrder: integer("question_order").notNull().default(0),
  questionImageSrc: text("question_image_src").notNull(),
  ratingSum: integer("rating_sum").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  averageRating: integer("average_rating", { mode: "number" }),
});

export const answer = sqliteTable("answer", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .references(() => question.id)
    .notNull(),
  answerImageSrc: text("answer_image_src").notNull(),
  answerOrder: integer("answer_order").notNull().default(0),
});

export const questionRating = sqliteTable("question_rating", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .references(() => question.id)
    .notNull(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  rating: integer("rating").notNull(),
});

export const questionComment = sqliteTable("question_comment", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .references(() => question.id)
    .notNull(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  comment: text("comment").notNull(),
});

export const questionCommentReply = sqliteTable("question_comment_reply", {
  id: text("id").primaryKey(),
  commentId: text("comment_id")
    .references(() => questionComment.id)
    .notNull(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
});

// Relations definitions
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ratings: many(questionRating),
  comments: many(questionComment),
  commentReplies: many(questionCommentReply),
}));

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
  questions: many(question),
}));

export const subjectRelations = relations(subject, ({ one, many }) => ({
  curriculum: one(curriculum, {
    fields: [subject.curriculumName],
    references: [curriculum.name],
  }),
  topics: many(topic),
  questions: many(question),
}));

export const topicRelations = relations(topic, ({ one, many }) => ({
  subject: one(subject, {
    fields: [topic.subjectCode],
    references: [subject.subjectCode],
  }),
  curriculum: one(curriculum, {
    fields: [topic.curriculumName],
    references: [curriculum.name],
  }),
  questions: many(question),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  subject: one(subject, {
    fields: [question.subjectCode],
    references: [subject.subjectCode],
  }),
  topic: one(topic, {
    fields: [question.topicName],
    references: [topic.name],
  }),
  curriculum: one(curriculum, {
    fields: [question.curriculumName],
    references: [curriculum.name],
  }),
  answers: many(answer),
  ratings: many(questionRating),
  comments: many(questionComment),
}));

export const answerRelations = relations(answer, ({ one }) => ({
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
}));

export const questionRatingRelations = relations(questionRating, ({ one }) => ({
  question: one(question, {
    fields: [questionRating.questionId],
    references: [question.id],
  }),
  user: one(user, {
    fields: [questionRating.userId],
    references: [user.id],
  }),
}));

export const questionCommentRelations = relations(
  questionComment,
  ({ one, many }) => ({
    question: one(question, {
      fields: [questionComment.questionId],
      references: [question.id],
    }),
    user: one(user, {
      fields: [questionComment.userId],
      references: [user.id],
    }),
    replies: many(questionCommentReply),
  })
);

export const questionCommentReplyRelations = relations(
  questionCommentReply,
  ({ one }) => ({
    comment: one(questionComment, {
      fields: [questionCommentReply.commentId],
      references: [questionComment.id],
    }),
    user: one(user, {
      fields: [questionCommentReply.userId],
      references: [user.id],
    }),
  })
);
