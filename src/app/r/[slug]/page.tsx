import { MiniCreatePost, PostFeed } from "@/components";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface CommunityPageProps {
  params: {
    slug: string;
  };
}

const CommunityPage = async ({ params }: CommunityPageProps) => {
  const { slug } = params;
  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          postVotes: true,
          comments: true,
          subreddit: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        // Infinite Scrolling Pagination Results
        // `take` determines the number of posts we want to display per fetch
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl'>r/{subreddit.name}</h1>

      <MiniCreatePost session={session} />

      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>
  );
};

export default CommunityPage;
