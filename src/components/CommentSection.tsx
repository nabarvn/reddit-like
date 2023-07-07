import { CreateComment, PostComment } from "@/components";
import { Comment, CommentVote, User } from "@prisma/client";
import { Session } from "next-auth";

type ReplyComment = Comment & {
  author: User;
  commentVotes: CommentVote[];
};

type ExtendedComment = Comment & {
  author: User;
  commentVotes: CommentVote[];
  replies: ReplyComment[];
};

interface CommentSectionProps {
  session: Session | null;
  postId: string;
  getComments: () => Promise<ExtendedComment[]>;
}

const CommentSection = async ({
  session,
  postId,
  getComments,
}: CommentSectionProps) => {
  // Any method involving `authOptions` throws an error in a server component which is not `page.tsx` or `layout.tsx`
  // const session = await getServerSession();   -> OK
  // const session = await getServerSession(authOptions);   -> ERROR
  // const session = await getAuthSession();   -> ERROR

  let comments: ExtendedComment[] = [];

  if (getComments) {
    comments = await getComments();
  }

  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      <hr className='w-full h-px my-6' />

      <CreateComment postId={postId} />

      <div className='flex flex-col gap-y-6 mt-4'>
        {comments
          .filter((comment) => !comment.replyToId)
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
              <div key={topLevelComment.id} className='flex flex-col'>
                {/* render top-level comments */}
                <div className='mb-2'>
                  <PostComment
                    key='comment'
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
                        className='border-l-2 border-zinc-200 py-2 pl-4 ml-2'
                      >
                        <PostComment
                          key='reply'
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
