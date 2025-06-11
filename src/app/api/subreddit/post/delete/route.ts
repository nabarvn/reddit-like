import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { PostDeleteValidator } from "@/lib/validators/post";

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);

    const { postId } = PostDeleteValidator.parse({
      postId: url.searchParams.get("postId"),
    });

    const post = await db.post.findFirst({
      where: {
        id: postId,
        authorId: session.user.id,
      },
    });

    if (!post) {
      return new Response("Post not found or you are not the owner", {
        status: 404,
      });
    }

    await db.post.delete({
      where: {
        id: postId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not delete post, please try again later", {
      status: 500,
    });
  }
}
