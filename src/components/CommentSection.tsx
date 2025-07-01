"use client";

import axios from "axios";
import { Session } from "next-auth";
import { Comment, CommentVote, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { CommentSkeleton, CreateComment, PostComment } from "@/components";

type ReplyComment = Comment & {
  replies: ReplyComment[];
  commentVotes: CommentVote[];
  author: User;
};

interface CommentSectionProps {
  session: Session | null;
  postId: string;
}

const CommentSection = ({ session, postId }: CommentSectionProps) => {
  const { data: comments, isLoading } = useQuery<ReplyComment[]>({
    queryKey: ["comments"],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/subreddit/post/comment?postId=${postId}`
      );

      return data;
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {isLoading && (
          <li className="flex flex-col col-span-2 space-y-6">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </li>
        )}

        {comments
          ?.filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmount =
              topLevelComment.commentVotes.reduce((acc, commentVote) => {
                if (commentVote.type === "UP") return acc + 1;
                if (commentVote.type === "DOWN") return acc - 1;

                return acc;
              }, 0);

            const topLevelCommentVote = topLevelComment.commentVotes.find(
              (commentVote) => commentVote.userId === session?.user.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                {/* render top-level comments */}
                <div className="mb-2">
                  <PostComment
                    key="comment"
                    postId={postId}
                    comment={topLevelComment}
                    initialCommentVotesAmount={topLevelCommentVotesAmount}
                    initialCommentVote={topLevelCommentVote}
                  />
                </div>

                {/* render first level replies */}
                {topLevelComment.replies
                  .sort((a, b) => b.commentVotes.length - a.commentVotes.length)
                  .map((firstLevelReply) => {
                    const firstLevelReplyVotesAmount =
                      firstLevelReply.commentVotes.reduce(
                        (acc, commentVote) => {
                          if (commentVote.type === "UP") return acc + 1;
                          if (commentVote.type === "DOWN") return acc - 1;

                          return acc;
                        },
                        0
                      );

                    const firstLevelReplyVote =
                      firstLevelReply.commentVotes.find(
                        (commentVote) => commentVote.userId === session?.user.id
                      );

                    return (
                      <div
                        key={firstLevelReply.id}
                        className="border-l-2 border-zinc-200 py-2 pl-4 ml-2"
                      >
                        <PostComment
                          key="reply"
                          postId={postId}
                          comment={firstLevelReply}
                          initialCommentVotesAmount={firstLevelReplyVotesAmount}
                          initialCommentVote={firstLevelReplyVote}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentSection;
