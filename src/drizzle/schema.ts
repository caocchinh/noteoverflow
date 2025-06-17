import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
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
  id: text("subject_id").notNull().primaryKey(),
  curriculumName: text("curriculum_name")
    .references(() => curriculum.name, { onDelete: "restrict" })
    .notNull(),
});

export const season = sqliteTable("season", {
  id: text("season_id").primaryKey(),
  subjectId: text("subject_id")
    .references(() => subject.id, { onDelete: "cascade" })
    .notNull(),
});

export const paperType = sqliteTable("paper_type", {
  id: text("paper_type_id").primaryKey(),
  subjectId: text("subject_id")
    .references(() => subject.id, { onDelete: "cascade" })
    .notNull(),
});

export const year = sqliteTable("year", {
  id: text("year_id").primaryKey(),
  subjectId: text("subject_id")
    .references(() => subject.id, { onDelete: "cascade" })
    .notNull(),
});

export const topic = sqliteTable("topic", {
  name: text("name").notNull().primaryKey().unique(),
  subjectId: text("subject_id")
    .references(() => subject.id, { onDelete: "cascade" })
    .notNull(),
});

export const question = sqliteTable("question", {
  id: text("id").primaryKey().unique(),
  yearId: integer("year_id")
    .references(() => year.id, { onDelete: "cascade" })
    .notNull(),
  seasonId: text("season_id")
    .references(() => season.id, { onDelete: "cascade" })
    .notNull(),
  paperTypeId: integer("paper_type_id")
    .references(() => paperType.id, { onDelete: "cascade" })
    .notNull(),
  paperVariant: text("paper_variant").notNull(),
  uploadedBy: text("uploaded_by")
    .references(() => user.id)
    .notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  subjectId: text("subject_id")
    .references(() => subject.id, { onDelete: "cascade" })
    .notNull(),
  topicName: text("topic_name")
    .references(() => topic.name)
    .notNull(),

  questionNumber: integer("question_number").notNull(),
  questionOrder: integer("question_order").notNull().default(0),
  questionImageSrc: text("question_image_src").notNull(),
  ratingSum: integer("rating_sum").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
});

export const answer = sqliteTable(
  "answer",
  {
    questionId: text("question_id")
      .references(() => question.id, { onDelete: "cascade" })
      .notNull(),
    answerImageSrc: text("answer_image_src").notNull(),
    answerOrder: integer("answer_order").notNull().default(0),
  },
  (table) => {
    return [primaryKey({ columns: [table.questionId, table.answerOrder] })];
  }
);

export const questionRating = sqliteTable(
  "question_rating",
  {
    questionId: text("question_id")
      .references(() => question.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
  },
  (table) => {
    return [primaryKey({ columns: [table.questionId, table.userId] })];
  }
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ratings: many(questionRating),
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
    fields: [topic.subjectId],
    references: [subject.id],
  }),

  questions: many(question),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  subject: one(subject, {
    fields: [question.subjectId],
    references: [subject.id],
  }),
  topic: one(topic, {
    fields: [question.topicName],
    references: [topic.name],
  }),
  season: one(season, {
    fields: [question.seasonId],
    references: [season.id],
  }),
  paperType: one(paperType, {
    fields: [question.paperTypeId],
    references: [paperType.id],
  }),
  year: one(year, {
    fields: [question.yearId],
    references: [year.id],
  }),
  answers: many(answer),
  ratings: many(questionRating),
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

export const seasonRelations = relations(season, ({ one, many }) => ({
  subject: one(subject, {
    fields: [season.subjectId],
    references: [subject.id],
  }),
  questions: many(question),
}));

export const paperTypeRelations = relations(paperType, ({ one, many }) => ({
  subject: one(subject, {
    fields: [paperType.subjectId],
    references: [subject.id],
  }),
  questions: many(question),
}));

export const yearRelations = relations(year, ({ one, many }) => ({
  subject: one(subject, {
    fields: [year.subjectId],
    references: [subject.id],
  }),
  questions: many(question),
}));
