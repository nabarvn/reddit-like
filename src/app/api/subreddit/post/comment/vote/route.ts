import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuthSession();

    // guard clause
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // check if comment vote already exists
    const existingCommentVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    // when comment vote exists
    if (existingCommentVote) {
      if (existingCommentVote.type === voteType) {
        // for same comment vote type
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });

        return new Response("OK", { status: 200 });
      } else {
        // for different comment vote type
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        });

        return new Response("OK", { status: 200 });
      }
    }

    // when comment vote does not exist
    await db.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId,
      },
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    // for any kind of parsing error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not register your vote", { status: 500 });
  }
}
