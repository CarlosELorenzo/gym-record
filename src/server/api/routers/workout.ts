import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { workouts } from "~/server/db/schema";

export const workoutRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.workouts.findMany();
  }),
});
