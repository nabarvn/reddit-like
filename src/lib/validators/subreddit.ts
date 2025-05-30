import { z } from "zod";

export const SubredditValidator = z.object({
  name: z
    .string()
    .min(3, { message: "Subreddit name must be at least 3 characters long." })
    .max(21, {
      message: "Subreddit name must be no more than 21 characters long.",
    })
    .regex(/^[a-z]+$/, {
      message: "Subreddit name can only contain lowercase letters.",
    }),
});

export const SubredditSubscriptionValidator = z.object({
  subredditId: z.string(),
});

export type CreateSubredditPayload = z.infer<typeof SubredditValidator>;

export type SubscribeToSubredditPayload = z.infer<
  typeof SubredditSubscriptionValidator
>;

export const SubredditDeleteValidator = z.object({
  subredditId: z.string(),
});

export type DeleteSubredditPayload = z.infer<typeof SubredditDeleteValidator>;
