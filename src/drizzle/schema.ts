import { relations } from 'drizzle-orm';
import {
  foreignKey,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text('role').notNull().default('user'),
  banned: integer('banned', { mode: 'boolean' })
    .$defaultFn(() => false)
    .notNull(),
  banReason: text('ban_reason'),
  banExpiresAt: integer('ban_expires_at', { mode: 'timestamp' }),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by').references(() => user.id),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const curriculum = sqliteTable('curriculum', {
  name: text('name').notNull().primaryKey().unique(),
});

export const subject = sqliteTable(
  'subject',
  {
    id: text('subject_id').notNull(),
    curriculumName: text('curriculum_name')
      .references(() => curriculum.name, { onDelete: 'restrict' })
      .notNull(),
  },
  (table) => {
    return [primaryKey({ columns: [table.id, table.curriculumName] })];
  }
);

export const season = sqliteTable(
  'season',
  {
    season: text('season').notNull(),
    subjectId: text('subject_id')
      .references(() => subject.id, { onDelete: 'cascade' })
      .notNull(),
    curriculumName: text('curriculum_name')
      .references(() => curriculum.name, { onDelete: 'restrict' })
      .notNull(),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.subjectId, table.season, table.curriculumName],
      }),
    ];
  }
);

export const paperType = sqliteTable(
  'paper_type',
  {
    paperType: integer('paper_type').notNull(),
    subjectId: text('subject_id')
      .references(() => subject.id, { onDelete: 'cascade' })
      .notNull(),
    curriculumName: text('curriculum_name')
      .references(() => curriculum.name, { onDelete: 'restrict' })
      .notNull(),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.subjectId, table.paperType, table.curriculumName],
      }),
    ];
  }
);

export const year = sqliteTable(
  'year',
  {
    year: integer('year').notNull(),
    subjectId: text('subject_id')
      .references(() => subject.id, { onDelete: 'cascade' })
      .notNull(),
    curriculumName: text('curriculum_name')
      .references(() => curriculum.name, { onDelete: 'restrict' })
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.subjectId, table.year, table.curriculumName],
    }),
  ]
);

export const topic = sqliteTable(
  'topic',
  {
    topic: text('topic').notNull(),
    subjectId: text('subject_id')
      .references(() => subject.id, { onDelete: 'cascade' })
      .notNull(),
    curriculumName: text('curriculum_name')
      .references(() => curriculum.name, { onDelete: 'restrict' })
      .notNull(),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.subjectId, table.topic, table.curriculumName],
      }),
    ];
  }
);

export const question = sqliteTable(
  'question',
  {
    id: text('id').primaryKey().unique(),
    year: integer('year').notNull(),
    season: text('season').notNull(),
    paperType: integer('paper_type').notNull(),
    paperVariant: integer('paper_variant').notNull(),
    topic: text('topic').notNull(),
    uploadedBy: text('uploaded_by')
      .references(() => user.id)
      .notNull(),
    uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    subjectId: text('subject_id')
      .references(() => subject.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
    curriculumName: text('curriculum_name')
      .references(() => curriculum.name, { onDelete: 'restrict' })
      .notNull(),

    questionNumber: integer('question_number').notNull(),
    ratingSum: integer('rating_sum').notNull().default(0),
    ratingCount: integer('rating_count').notNull().default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.subjectId, table.year, table.curriculumName],
      foreignColumns: [year.subjectId, year.year, year.curriculumName],
    }),
    foreignKey({
      columns: [table.subjectId, table.season, table.curriculumName],
      foreignColumns: [season.subjectId, season.season, season.curriculumName],
    }),
    foreignKey({
      columns: [table.subjectId, table.paperType, table.curriculumName],
      foreignColumns: [
        paperType.subjectId,
        paperType.paperType,
        paperType.curriculumName,
      ],
    }),
    foreignKey({
      columns: [table.subjectId, table.topic, table.curriculumName],
      foreignColumns: [topic.subjectId, topic.topic, topic.curriculumName],
    }),
  ]
);

export const questionImage = sqliteTable(
  'question_image',
  {
    questionId: text('question_id')
      .references(() => question.id, { onDelete: 'cascade' })
      .notNull(),
    imageSrc: text('image_src').notNull(),
    order: integer('order').notNull().default(0),
  },
  (table) => {
    return [primaryKey({ columns: [table.questionId, table.order] })];
  }
);

export const answer = sqliteTable(
  'answer',
  {
    questionId: text('question_id')
      .references(() => question.id, { onDelete: 'cascade' })
      .notNull(),
    answer: text('answer').notNull(),
    order: integer('order').notNull().default(0),
  },
  (table) => {
    return [primaryKey({ columns: [table.questionId, table.order] })];
  }
);

export const questionRating = sqliteTable(
  'question_rating',
  {
    questionId: text('question_id')
      .references(() => question.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    rating: integer('rating').notNull(),
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

export const subjectRelations = relations(subject, ({ many }) => ({
  curriculum: many(curriculum),
  topics: many(topic),
  questions: many(question),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  subject: one(subject, {
    fields: [question.subjectId],
    references: [subject.id],
  }),
  topic: one(topic, {
    fields: [question.subjectId, question.topic, question.curriculumName],
    references: [topic.subjectId, topic.topic, topic.curriculumName],
  }),
  season: one(season, {
    fields: [question.subjectId, question.season, question.curriculumName],
    references: [season.subjectId, season.season, season.curriculumName],
  }),
  paperType: one(paperType, {
    fields: [question.subjectId, question.paperType, question.curriculumName],
    references: [
      paperType.subjectId,
      paperType.paperType,
      paperType.curriculumName,
    ],
  }),
  year: one(year, {
    fields: [question.subjectId, question.year, question.curriculumName],
    references: [year.subjectId, year.year, year.curriculumName],
  }),
  questionImages: many(questionImage),
  answers: many(answer),
  ratings: many(questionRating),
}));

export const questionImageRelations = relations(questionImage, ({ one }) => ({
  question: one(question, {
    fields: [questionImage.questionId],
    references: [question.id],
  }),
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
  curriculum: one(curriculum, {
    fields: [season.curriculumName],
    references: [curriculum.name],
  }),
  questions: many(question),
}));

export const paperTypeRelations = relations(paperType, ({ one, many }) => ({
  subject: one(subject, {
    fields: [paperType.subjectId],
    references: [subject.id],
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
    references: [subject.id],
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
    references: [subject.id],
  }),

  curriculum: one(curriculum, {
    fields: [topic.curriculumName],
    references: [curriculum.name],
  }),
  questions: many(question),
}));
