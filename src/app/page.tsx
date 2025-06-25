import Link from "next/link";
import { db } from "@/lib/db";
import { PostFeed } from "@/components";
import { buttonVariants } from "@/components/ui/Button";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { HomeIcon } from "lucide-react";
import { Balancer } from "react-wrap-balancer";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const Home = async () => {
  const session = await getAuthSession();

  const joinedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreddit: true,
    },
  });

  const joinedCommunityIds = joinedCommunities.map(
    ({ subreddit }) => subreddit.id
  );

  // fetch only what we need for optimal performance
  const customFeedPosts =
    session && joinedCommunityIds.length > 0
      ? await db.post.findMany({
          where: {
            subreddit: {
              id: {
                in: joinedCommunityIds,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            postVotes: true,
            author: true,
            comments: true,
            subreddit: true,
          },
          take: INFINITE_SCROLL_PAGINATION_RESULTS,
        })
      : [];

  const generalFeedPosts =
    !session || joinedCommunityIds.length === 0
      ? await db.post.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            postVotes: true,
            author: true,
            comments: true,
            subreddit: true,
          },
          take: INFINITE_SCROLL_PAGINATION_RESULTS,
        })
      : [];

  return (
    <div className="md:container max-w-6xl px-5 pt-12">
      <h1 className="font-bold text-3xl md:text-4xl">Your Feed</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {/* display either custom feed (authenticated view) or general feed (public view) */}
        {session && joinedCommunityIds.length > 0 ? (
          <PostFeed key="custom" initialPosts={customFeedPosts} />
        ) : (
          <PostFeed key="general" initialPosts={generalFeedPosts} />
        )}

        {/* subreddit info */}
        <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
          <div className="bg-emerald-100 px-5 md:px-6 py-4">
            <p className="font-semibold flex items-center gap-1.5 py-3">
              <HomeIcon className="h-4 w-4" />
              Home
            </p>
          </div>

          <div className="-my-3 divide-y divide-gray-100 text-sm leading-6 px-3 md:px-6 py-4">
            <div className="flex justify-between gap-x-4 px-2 md:px-0 py-3">
              <p className="text-zinc-500">
                <Balancer ratio={0.5}>
                  This is where you can stay connected with your favorite
                  communities. Join to check in!
                </Balancer>
              </p>
            </div>

            <Link
              href="/r/create"
              className={buttonVariants({
                className: "w-full mt-4 mb-6",
              })}
            >
              Create Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
