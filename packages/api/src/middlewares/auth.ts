import { ORPCError, os } from "@orpc/server";

export const authedMiddleware = os.middleware(async ({ context, next }) => {
  // @ts-expect-error
  if (!context?.userId)
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
  // @ts-expect-error
  return next({ context: { ...context, userId: context.userId as string } });
});
