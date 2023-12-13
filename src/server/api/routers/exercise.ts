import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { exercises } from "~/server/db/schema";

export const exerciseRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.exercises.findMany();
  }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(exercises).values({
        name: input.name,
      });
    }),
});
