import { db } from "@/lib/db";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { formatTimeToNow } from "@/lib/utils";
import { PostVoteServer } from "@/components/post-vote";
import { buttonVariants } from "@/components/ui/Button";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { CommentSection, EditorOutput, PostDeleteButton } from "@/components";

interface PostDetailsPageProps {
  params: {
    postId: string;
  };
}

// the option value 'force-dynamic' is equivalent to `getServerSideProps` and makes sure the fetched data is always up-to-date
export const dynamic = "force-dynamic";

// the option value 'force-no-store' forces all fetches to be refetched every request
export const fetchCache = "force-no-store";

const PostDetailsPage = async ({
  params: { postId },
}: PostDetailsPageProps) => {
  const session = await getAuthSession();

  // make a db call
  const post = await db.post.findFirst({
    where: {
      id: postId,
    },
    include: {
      postVotes: true,
      author: true,
    },
  });

  if (!post) return notFound();

  return (
    <div className="mb-12">
      <div className="flex h-full items-start justify-between">
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-expect-error server component */}
          <PostVoteServer
            session={session}
            postId={post.id}
            initialPostVotesAmount={post.postVotes.reduce((acc, vote) => {
              if (vote.type === "UP") return acc + 1;
              if (vote.type === "DOWN") return acc - 1;
              return acc;
            }, 0)}
            initialPostVote={
              post.postVotes.find((vote) => vote.userId === session?.user.id)
                ?.type
            }
          />
        </Suspense>

        <div className="w-0 bg-white flex-1 rounded-md p-4">
          <div>
            <div className="flex items-start justify-between gap-2 pt-1">
              <div>
                <p className="max-h-40 text-xs text-gray-500 truncate">
                  Posted by u/{post.author.username}
                  <span className="mx-1">•</span>
                  {formatTimeToNow(new Date(post.createdAt))}
                </p>

                <h1 className="text-xl font-semibold leading-6 text-gray-900 py-2">
                  {post.title}
                </h1>
              </div>

              {session?.user.id === post.authorId && (
                <PostDeleteButton postId={post.id} />
              )}
            </div>
          </div>

          <EditorOutput content={post.content} />

          <Suspense
            fallback={
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            }
          >
            <CommentSection session={session} postId={post.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const PostVoteShell = () => {
  return (
    <div className="flex flex-col items-center w-20 pr-6">
      {/* upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>

      {/* score */}
      <div className="text-center font-medium text-sm text-zinc-900 py-2">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      {/* downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
};

export default PostDetailsPage;
