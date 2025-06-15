import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { CommentDeleteValidator } from "@/lib/validators/comment";

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);

    const { commentId } = CommentDeleteValidator.parse({
      commentId: url.searchParams.get("commentId"),
    });

    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        authorId: session.user.id,
      },
    });

    if (!comment) {
      return new Response("Comment not found or you are not the owner", {
        status: 404,
      });
    }

    await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not delete comment, please try again later", {
      status: 500,
    });
  }
}
