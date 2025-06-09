import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { SubscriptionToggle, ToFeedButton } from "@/components";
import { notFound } from "next/navigation";
import { SubredditDeleteButton } from "@/components";

const SubredditLayout = async ({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}) => {
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
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      });

  // !! turns a value into a boolean one
  const isSubscribed = !!subscription;

  if (!subreddit) return notFound();

  const memberCount = await db.subscription.count({
    where: {
      subreddit: {
        name: slug,
      },
    },
  });

  return (
    <div className="md:container max-w-6xl mx-auto h-full pt-12 px-5">
      <div>
        <ToFeedButton />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6 border-t-2 border-t-zinc-300 md:border-none pt-12 md:pt-0 mt-10 md:mt-0">
            {children}
          </div>

          {/* info sidebar */}
          <div className="flex flex-col overflow-hidden h-fit rounded-lg shadow border border-gray-200 order-first md:order-last">
            <div className="h-1/3 px-3 lg:px-6 py-4">
              <p className="font-semibold h-fit py-1">About r/{slug}</p>
            </div>

            <dl className="divide-y divide-gray-100 text-sm leading-6 bg-white h-fit px-3 lg:px-6 py-3">
              <div className="flex justify-between gap-x-4 py-1">
                <dt className="text-gray-500">Created</dt>

                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-1">
                <dt className="text-gray-500">Members</dt>

                <dd className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dd>
              </div>

              {subreddit.creatorId === session?.user.id ? (
                <div className="flex justify-between gap-x-4 py-1">
                  <p className="text-gray-500">You created this community!</p>
                </div>
              ) : null}

              {subreddit.creatorId !== session?.user.id ? (
                <SubscriptionToggle
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                  isSubscribed={isSubscribed}
                />
              ) : null}

              <Link
                href={`/r/${slug}/submit`}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full mt-3",
                })}
              >
                Create Post
              </Link>

              {subreddit.creatorId === session?.user.id ? (
                <SubredditDeleteButton subredditId={subreddit.id} />
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubredditLayout;
