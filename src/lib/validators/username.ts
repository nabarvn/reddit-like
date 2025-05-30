import { z } from "zod";

export const UsernameValidator = z.object({
  name: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(32, { message: "Username must be no more than 32 characters long." })
    .regex(/^[a-z0-9]+$/, {
      message: "Username can only contain lowercase letters and numbers.",
    }),
});

export type UsernameUpdateRequest = z.infer<typeof UsernameValidator>;
