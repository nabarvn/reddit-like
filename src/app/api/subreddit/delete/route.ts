import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { SubredditDeleteValidator } from "@/lib/validators/subreddit";

async function deleteCommentsRecursive(commentId: string) {
  const replies = await db.comment.findMany({
    where: {
      replyToId: commentId,
    },
  });

  for (const reply of replies) {
    await deleteCommentsRecursive(reply.id);
  }

  await db.comment.delete({
    where: {
      id: commentId,
    },
  });
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subredditId } = SubredditDeleteValidator.parse(body);

    const subreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
      include: {
        posts: {
          include: {
            comments: true,
          },
        },
      },
    });

    if (!subreddit) {
      return new Response("Subreddit not found or you are not the owner", {
        status: 404,
      });
    }

    for (const post of subreddit.posts) {
      const topLevelComments = await db.comment.findMany({
        where: {
          postId: post.id,
          replyToId: null,
        },
      });

      for (const comment of topLevelComments) {
        await deleteCommentsRecursive(comment.id);
      }
    }

    await db.subreddit.delete({
      where: {
        id: subredditId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not delete subreddit, please try again later", {
      status: 500,
    });
  }
}
