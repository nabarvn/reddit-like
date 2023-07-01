"use client";

import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import { PostCard } from "@/components";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

const PostFeed = ({ initialPosts, subredditName }: PostFeedProps) => {
  const lastViewablePostRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();

  const { ref: observerRef, entry } = useIntersection({
    root: lastViewablePostRef.current,
    threshold: 1,
  });

  // infinite scrolling functionality
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      // api endpoint to fetch more posts from db
      const query =
        `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
        (subredditName ? `&subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);

      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className='flex flex-col col-span-2 space-y-6'>
      {posts.map((post, index) => {
        // calculate total post votes amount
        const postVotesInteger = post.postVotes.reduce((acc, postVote) => {
          if (postVote.type === "UP") return acc + 1;
          if (postVote.type === "DOWN") return acc - 1;

          return acc;
        }, 0);

        // determine if the user has already voted
        const currentPostVote = post.postVotes.find(
          (postVote) => postVote.userId === session?.user.id
        );

        // render more posts when intersection observer crosses the last viewable post
        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={observerRef}>
              <PostCard
                post={post}
                subredditName={post.subreddit.name}
                numberOfComments={post.comments.length}
                postVotesInteger={postVotesInteger}
                currentPostVote={currentPostVote}
              />
            </li>
          );
        } else {
          return (
            <PostCard
              key={post.id}
              post={post}
              subredditName={post.subreddit.name}
              numberOfComments={post.comments.length}
              postVotesInteger={postVotesInteger}
              currentPostVote={currentPostVote}
            />
          );
        }
      })}
    </ul>
  );
};

export default PostFeed;
