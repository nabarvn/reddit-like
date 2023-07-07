import { VoteType } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  authorUsername: string;
  content: string; // the type is `string` and not `any` because we are fetching the content as json
  currentVote: VoteType | null;
  createdAt: Date;
};
