import { CommentSection, EditorOutput } from "@/components";
import { PostVoteServer } from "@/components/post-vote";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedPost } from "@/types/redis";
import { Post, PostVote, User } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PostDetailsPageProps {
  params: {
    postId: string;
  };
}

// The option value 'force-dynamic' is equivalent to `getServerSideProps` and makes sure the fetched data is always up-to-date
export const dynamic = "force-dynamic";

// The option value 'force-no-store' forces all fetches to be refetched every request
export const fetchCache = "force-no-store";

const PostDetailsPage = async ({
  params: { postId },
}: PostDetailsPageProps) => {
  const cachedPost = (await redis.hgetall(`post:${postId}`)) as CachedPost;

  const session = await getAuthSession();

  // Declare `post` as a mutable element in order to perform a conditional check
  let post: (Post & { postVotes: PostVote[]; author: User }) | null = null;

  // make a db call
  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        postVotes: true,
        author: true,
      },
    });
  }

  if (!post && !cachedPost) return notFound();

  return (
    <div>
      <div className='flex h-full items-start justify-between'>
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-expect-error server component */}
          <PostVoteServer
            session={session}
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              // making db call in a server component which is not `page.tsx` or `layout.tsx` throws an error
              return await db.post.findUnique({
                where: {
                  id: postId,
                },
                include: {
                  postVotes: true,
                },
              });
            }}
          />
        </Suspense>

        <div className='w-0 bg-white flex-1 rounded-md p-4'>
          <p className='max-h-40 text-xs text-gray-500 truncate mt-1'>
            Posted by u/{post?.author.username ?? cachedPost.authorUsername}
            <span className='mx-1'>•</span>
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>

          <h1 className='text-xl font-semibold leading-6 text-gray-900 py-2'>
            {post?.title ?? cachedPost.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost.content} />

          <Suspense
            fallback={
              <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
            }
          >
            {/* @ts-expect-error server component */}
            <CommentSection
              session={session}
              postId={post?.id ?? cachedPost.id}
              getComments={async () => {
                // making db call in a server component which is not `page.tsx` or `layout.tsx` throws an error
                return await db.comment.findMany({
                  where: {
                    postId,
                    replyToId: null, // only fetch top-level comments
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
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const PostVoteShell = () => {
  return (
    <div className='flex flex-col items-center w-20 pr-6'>
      {/* upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className='h-5 w-5 text-zinc-700' />
      </div>

      {/* score */}
      <div className='text-center font-medium text-sm text-zinc-900 py-2'>
        <Loader2 className='h-3 w-3 animate-spin' />
      </div>

      {/* downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className='h-5 w-5 text-zinc-700' />
      </div>
    </div>
  );
};

export default PostDetailsPage;
