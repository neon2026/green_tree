import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { updateUserProfile } from "./db";
import { projectsRouter, designsRouter } from "./routers/projects";
import { budgetRouter } from "./routers/budget";
import { renderingsRouter } from "./routers/renderings";
import { constructionsRouter } from "./routers/constructions";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().trim().min(1, "请输入姓名").max(80, "姓名不能超过 80 个字符"),
          email: z.string().trim().email("请输入有效邮箱地址").max(320, "邮箱不能超过 320 个字符").nullable(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const updatedUser = await updateUserProfile(ctx.user.openId, {
          name: input.name,
          email: input.email,
        });

        return updatedUser ?? {
          ...ctx.user,
          name: input.name,
          email: input.email,
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: projectsRouter,
  designs: designsRouter,
  budget: budgetRouter,
  renderings: renderingsRouter,
  constructions: constructionsRouter,
});

export type AppRouter = typeof appRouter;
