import { CACHE_AFTER_UPVOTES } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuthSession();

    // guard clause
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // check if post vote already exists
    const existingPostVote = await db.postVote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    // grab certain post attributes for caching purposes
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        postVotes: true,
      },
    });

    // handle a rare error
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    // when post vote exists
    if (existingPostVote) {
      // for same post vote type
      if (existingPostVote.type === voteType) {
        await db.postVote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        });

        return new Response("OK", { status: 200 });
      }

      // for different post vote type
      await db.postVote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      // recount the post votes
      const postVotesAmount = post.postVotes.reduce((acc, postVote) => {
        if (postVote.type === "UP") return acc + 1;
        if (postVote.type === "DOWN") return acc - 1;

        return acc;
      }, 0);

      if (postVotesAmount >= CACHE_AFTER_UPVOTES) {
        const cachedPayload: CachedPost = {
          id: post.id,
          title: post.title,
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          currentVote: voteType,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${postId}`, cachedPayload);
      }

      return new Response("OK", { status: 200 });
    }

    // when post vote does not exist
    await db.postVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      },
    });

    // recount the post votes
    const postVotesAmount = post.postVotes.reduce((acc, postVote) => {
      if (postVote.type === "UP") return acc + 1;
      if (postVote.type === "DOWN") return acc - 1;

      return acc;
    }, 0);

    if (postVotesAmount >= CACHE_AFTER_UPVOTES) {
      const cachedPayload: CachedPost = {
        id: post.id,
        title: post.title,
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        currentVote: voteType,
        createdAt: post.createdAt,
      };

      await redis.hset(`post:${postId}`, cachedPayload);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    // for any kind of parsing error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not register your vote", { status: 500 });
  }
}
