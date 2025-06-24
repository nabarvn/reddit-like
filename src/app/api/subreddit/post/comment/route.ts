import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { CommentValidator } from "@/lib/validators/comment";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");

  try {
    if (!postId) {
      return new Response("Invalid query", { status: 400 });
    }

    // only fetch top-level comments
    const comments = await db.comment.findMany({
      where: {
        postId,
        replyToId: null,
      },
      include: {
        author: true,
        commentVotes: true,
        replies: {
          // first level replies
          include: {
            author: true,
            commentVotes: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(comments));
  } catch (error) {
    return new Response("Could not fetch comments", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // parse to get only what is expected
    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // create comment
    await db.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        text,
        replyToId,
      },
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    // for any kind of parsing error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not create comment", { status: 500 });
  }
}
