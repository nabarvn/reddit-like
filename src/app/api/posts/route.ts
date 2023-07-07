import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  // to display communities the user is following
  let joinedCommunityIDs: string[] = [];

  if (session) {
    const joinedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subreddit: true,
      },
    });

    joinedCommunityIDs = joinedCommunities.map(({ subreddit }) => subreddit.id);
  }

  // handle data fetching logic
  try {
    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        subredditName: url.searchParams.get("subredditName"),
      });

    // construct a where clause to pass in Prisma db
    let whereClause = {};

    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session) {
      whereClause = {
        subreddit: {
          id: {
            in: joinedCommunityIDs,
          },
        },
      };
    }

    // determine which posts should be fetched from the db
    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        postVotes: true,
        author: true,
        comments: true,
      },
      // would not throw an error because syntactically `whereClause` is aligned with what Prisma expects
      where: whereClause,
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    // for any kind of parsing error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not fetch more posts", { status: 500 });
  }
}
