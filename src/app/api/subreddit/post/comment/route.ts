import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

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
