"use client";

import { formatTimeToNow } from "@/lib/utils";
import { Post, PostVote, User } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import { useRef } from "react";
import { EditorOutput } from "@/components";
import { PostVoteClient } from "./post-vote";
import Balancer from "react-wrap-balancer";

type PartialPostVote = Pick<PostVote, "type">;

interface PostCardProps {
  subredditName: string;
  post: Post & {
    author: User;
    postVotes: PostVote[];
  };
  numberOfComments: number;
  postVotesAmount: number;
  currentPostVote?: PartialPostVote;
}

const PostCard = ({
  post,
  subredditName,
  numberOfComments,
  postVotesAmount,
  currentPostVote,
}: PostCardProps) => {
  const postCardRef = useRef<HTMLDivElement>(null); // to dynamically track post card's height

  return (
    <div className='rounded-md bg-white shadow'>
      <div className='flex justify-between px-3 md:px-6 py-4'>
        <PostVoteClient
          postId={post.id}
          initialPostVotesAmount={postVotesAmount}
          initialPostVote={currentPostVote?.type}
        />

        <div className='w-0 flex-1'>
          <div className='flex items-center max-h-40 text-xs text-gray-500'>
            {subredditName ? (
              <>
                {/* Use regular HTML anchor tag for the page to hard refresh when the link is clicked */}
                <a
                  href={`/r/${subredditName}`}
                  className='underline text-zinc-900 text-sm self-start underline-offset-2'
                >
                  r/{subredditName}
                </a>
              </>
            ) : null}

            <span className='hidden md:block mx-1 mt-0.5'>
              • Posted by u/{post.author.username} •
            </span>

            <span className='hidden md:block mt-0.5'>
              {formatTimeToNow(new Date(post.createdAt))}
            </span>
          </div>

          <span className='md:hidden max-h-40 text-xs text-gray-500 mr-1'>
            Posted by u/{post.author.username} •
          </span>

          <span className='md:hidden max-h-40 text-xs text-gray-500'>
            {formatTimeToNow(new Date(post.createdAt))}
          </span>

          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className='text-lg font-semibold leading-6 text-gray-900 py-2'>
              <Balancer ratio={0.5}>{post.title}</Balancer>
            </h1>
          </a>

          <div
            ref={postCardRef}
            className='relative text-sm max-h-40 w-full overflow-clip'
          >
            <EditorOutput content={post.content} />

            {postCardRef.current?.clientHeight === 160 ? (
              <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent' />
            ) : null}
          </div>
        </div>
      </div>

      <div className='bg-gray-50 z-20 text-sm p-4 sm:px-6'>
        <a
          href={`/r/${subredditName}/post/${post.id}`}
          className='w-fit flex items-center gap-2'
        >
          <MessageSquare className='h-4 w-4' />

          <span>
            {numberOfComments} {numberOfComments === 1 ? "comment" : "comments"}
          </span>
        </a>
      </div>
    </div>
  );
};

export default PostCard;
