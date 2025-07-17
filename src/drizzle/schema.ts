import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

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
  bookmarks: text("bookmarks"),
});

export const session = sqliteTable(
  "session",
  {
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
  },
  (table) => [index("idx_session_id").on(table.userId)]
);

export const account = sqliteTable(
  "account",
  {
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
  },
  (table) => [index("idx_account_id").on(table.userId)]
);

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

export const subject = sqliteTable(
  "subject",
  {
    subjectId: text("subject_id").notNull(),
    curriculumName: text("curriculum_name")
      .references(() => curriculum.name, { onDelete: "restrict" })
      .notNull(),
  },
  (table) => {
    return [primaryKey({ columns: [table.subjectId, table.curriculumName] })];
  }
);

export const season = sqliteTable(
  "season",
  {
    season: text("season").notNull(),
    subjectId: text("subject_id"),

    curriculumName: text("curriculum_name"),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.season, table.subjectId, table.curriculumName],
      }),
      foreignKey({
        columns: [table.subjectId, table.curriculumName],
        foreignColumns: [subject.subjectId, subject.curriculumName],
      }),
    ];
  }
);

export const paperType = sqliteTable(
  "paper_type",
  {
    paperType: integer("paper_type").notNull(),
    subjectId: text("subject_id"),
    curriculumName: text("curriculum_name"),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.paperType, table.subjectId, table.curriculumName],
      }),
      foreignKey({
        columns: [table.subjectId, table.curriculumName],
        foreignColumns: [subject.subjectId, subject.curriculumName],
      }),
    ];
  }
);

export const year = sqliteTable(
  "year",
  {
    year: integer("year").notNull(),
    subjectId: text("subject_id"),
    curriculumName: text("curriculum_name"),
  },
  (table) => [
    primaryKey({
      columns: [table.year, table.subjectId, table.curriculumName],
    }),
    foreignKey({
      columns: [table.subjectId, table.curriculumName],
      foreignColumns: [subject.subjectId, subject.curriculumName],
    }),
  ]
);

export const topic = sqliteTable(
  "topic",
  {
    topic: text("topic").notNull(),
    subjectId: text("subject_id"),
    curriculumName: text("curriculum_name"),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.topic, table.subjectId, table.curriculumName],
      }),
      foreignKey({
        columns: [table.subjectId, table.curriculumName],
        foreignColumns: [subject.subjectId, subject.curriculumName],
      }),
    ];
  }
);

export const question = sqliteTable(
  "question",
  {
    id: text("id").primaryKey().unique(),
    year: integer("year").notNull(),
    season: text("season").notNull(),
    paperType: integer("paper_type").notNull(),
    paperVariant: integer("paper_variant").notNull(),
    uploadedBy: text("uploaded_by")
      .references(() => user.id)
      .notNull(),
    uploadedAt: integer("uploaded_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    questionImages: text("question_images"),
    answers: text("answers"),
    subjectId: text("subject_id").notNull(),
    curriculumName: text("curriculum_name").notNull(),
    questionNumber: integer("question_number").notNull(),
  },
  (table) => [
    index("idx_question_filter").on(
      table.subjectId,
      table.curriculumName,
      table.paperType,
      table.year,
      table.season
    ),
    foreignKey({
      columns: [table.year, table.subjectId, table.curriculumName],
      foreignColumns: [year.year, year.subjectId, year.curriculumName],
    }),
    foreignKey({
      columns: [table.season, table.subjectId, table.curriculumName],
      foreignColumns: [season.season, season.subjectId, season.curriculumName],
    }),
    foreignKey({
      columns: [table.paperType, table.subjectId, table.curriculumName],
      foreignColumns: [
        paperType.paperType,
        paperType.subjectId,
        paperType.curriculumName,
      ],
    }),

    foreignKey({
      columns: [table.subjectId, table.curriculumName],
      foreignColumns: [subject.subjectId, subject.curriculumName],
    }),
  ]
);

export const questionTopic = sqliteTable(
  "question_topic",
  {
    questionId: text("question_id")
      .references(() => question.id, { onDelete: "cascade" })
      .notNull(),
    topic: text("topic"),
    subjectId: text("subject_id"),
    curriculumName: text("curriculum_name"),
  },
  (table) => {
    return [
      index("idx_question_topic").on(table.topic, table.questionId),
      primaryKey({ columns: [table.questionId, table.topic] }),
      foreignKey({
        columns: [table.topic, table.subjectId, table.curriculumName],
        foreignColumns: [topic.topic, topic.subjectId, topic.curriculumName],
      }),
    ];
  }
);

export const userBookmarkList = sqliteTable(
  "user_bookmark_list",
  {
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    listName: text("list_name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    visibility: text("visibility").notNull().default("private"),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.userId, table.listName, table.visibility] }),
    ];
  }
);

export const userBookmarks = sqliteTable(
  "user_bookmarks",
  {
    userId: text("user_id").notNull(),
    listName: text("list_name").notNull(),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.userId, table.listName, table.questionId] }),
      foreignKey({
        columns: [table.userId, table.listName],
        foreignColumns: [userBookmarkList.userId, userBookmarkList.listName],
      }),
    ];
  }
);

export const finishedQuestions = sqliteTable(
  "finished_questions",
  {
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    questionId: text("question_id")
      .references(() => question.id, { onDelete: "cascade" })
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => {
    return [primaryKey({ columns: [table.userId, table.questionId] })];
  }
);
