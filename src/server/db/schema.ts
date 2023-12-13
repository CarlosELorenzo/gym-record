import { relations, sql } from "drizzle-orm";
import {
  bigint,
  decimal,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `gym-record_${name}`);

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by_id", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (posts) => ({
    createByIdIdx: index("createdById_idx").on(posts.createdById),
    nameIndex: index("name_idx").on(posts.name),
  }),
);
// export const series = mysqlTable(
//   "serie",
//   {
//     id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
//     name: varchar("name", { length: 256 }),
//     wheigt: decimal("wheigt").notNull(),
//     reps: decimal("reps").notNull(),
//     createdAt: timestamp("created_at")
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updatedAt").onUpdateNow(),
//   },
//   (series) => ({
//     nameIndex: index("name_idx").on(series.name),
//   }),
// );

// export const exercise = mysqlTable(
//   "exercise",
//   {
//     id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
//     name: varchar("name", { length: 256 }),
//     createdAt: timestamp("created_at")
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updatedAt").onUpdateNow(),
//   },
//   (exercise) => ({
//     nameIndex: index("name_idx").on(exercise.name),
//   }),
// );

/**
 * User:

UserID (Primary Key)
FirstName
LastName
Email
Password
(Other relevant user details)
Exercise:

ExerciseID (Primary Key)
Name
Description
Category (e.g., cardio, strength, flexibility)
(Other relevant exercise details)
Workout:

WorkoutID (Primary Key)
UserID (Foreign Key referencing User.UserID)
Date
Duration
(Other relevant workout details)
WorkoutExercise:

WorkoutExerciseID (Primary Key)
WorkoutID (Foreign Key referencing Workout.WorkoutID)
ExerciseID (Foreign Key referencing Exercise.ExerciseID)
Sets
Repetitions
Weight (if applicable)
(Other relevant details for tracking exercise performance)
 */

export const exercises = mysqlTable("exercise", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
  name: varchar("name", { length: 256 }),
  description: varchar("description", { length: 256 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const workouts = mysqlTable("workout", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
  userId: bigint("user_id", { mode: "number" }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const workoutExercises = mysqlTable("workout_exercise", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
  workoutId: bigint("workout_id", { mode: "number" }),
  exerciseId: bigint("exercise_id", { mode: "number" }),
  reps: decimal("reps").notNull(),
  weight: decimal("weight").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
