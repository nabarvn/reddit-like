"use client";

import axios from "axios";
import { ExtendedPost } from "@/types/db";
import { useEffect } from "react";
import { useIntersection } from "@mantine/hooks";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostCard, PostSkeleton } from "@/components";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

const PostFeed = ({ initialPosts, subredditName }: PostFeedProps) => {
  const { data: session } = useSession();

  const { ref: observerRef, entry } = useIntersection({
    // observe visibility relative to viewport (default)
    root: null,
    threshold: 1,
  });

  // infinite scrolling functionality
  const { data, isFetched, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ["infinite-query", subredditName ?? "home"],
      async ({ pageParam = 1 }) => {
        // api endpoint to fetch more posts from db
        const query =
          `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
          (subredditName ? `&subredditName=${subredditName}` : "");

        const { data } = await axios.get(query);

        return data as ExtendedPost[];
      },
      {
        getNextPageParam: (lastPage, pages) => {
          // stop when API returns no items
          if (!lastPage || lastPage.length === 0) return undefined;
          return pages.length + 1;
        },
        initialData: { pages: [initialPosts], pageParams: [1] },
      }
    );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  // if initialPosts is empty, ensure the first page is fetched on mount
  useEffect(() => {
    if (initialPosts.length === 0 && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [initialPosts.length, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return isFetched ? (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        // calculate total post votes amount
        const postVotesAmount = post.postVotes.reduce((acc, postVote) => {
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
            <li key={post.id} ref={observerRef} className="flex flex-col">
              <PostCard
                post={post}
                subredditName={post.subreddit.name}
                numberOfComments={post.comments.length}
                postVotesAmount={postVotesAmount}
                currentPostVote={currentPostVote}
              />

              <Loader2
                className={
                  isFetchingNextPage
                    ? "block animate-spin self-center mt-5"
                    : "hidden"
                }
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
              postVotesAmount={postVotesAmount}
              currentPostVote={currentPostVote}
            />
          );
        }
      })}
    </ul>
  ) : (
    <li className="flex flex-col col-span-2 space-y-6">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </li>
  );
};

export default PostFeed;
