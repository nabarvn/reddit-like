"use client";

import { CommentVoteSystem, UserAvatar } from "@/components";
import { Button, Label, Textarea } from "@/components/ui";
import useCustomToast from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { formatTimeToNow } from "@/lib/utils";
import { CommentRequest } from "@/lib/validators/comment";
import { Comment, CommentVote, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type PartialCommentVote = Pick<CommentVote, "type">;

type ExtendedComment = Comment & {
  author: User;
  commentVotes: CommentVote[];
};

interface PostCommentProps {
  postId: string;
  comment: ExtendedComment;
  initialCommentVotesAmount: number;
  initialCommentVote?: PartialCommentVote;
}

const PostComment = ({
  postId,
  comment,
  initialCommentVotesAmount,
  initialCommentVote,
}: PostCommentProps) => {
  const { data: session } = useSession();
  const { loginToast } = useCustomToast();

  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const { mutate: postReply, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Could not post reply, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
      setIsReplying(false);
    },
  });

  return (
    <div ref={commentRef} className='flex flex-col'>
      <div className='flex items-center'>
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className='h-6 w-6'
        />

        <div className='flex items-center gap-x-1 ml-2'>
          <p className='text-sm font-medium text-gray-900'>
            u/{comment.author.username}
          </p>

          <span className='text-gray-500 mb-1'> • </span>

          <p className='max-h-40 truncate text-xs text-zinc-500'>
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className='text-sm text-zinc-900 mt-2 ml-8'>{comment.text}</p>

      <div className='flex flex-wrap items-center gap-2 mt-2 ml-8'>
        <CommentVoteSystem
          commentId={comment.id}
          initialCommentVotesAmount={initialCommentVotesAmount}
          initialCommentVote={initialCommentVote?.type}
        />

        <Button
          size='xs'
          variant='ghost'
          onClick={() => {
            if (!session) return router.push("/sign-in");
            setIsReplying(true);
          }}
        >
          <MessageSquare className='h-4 w-4 mr-1' />
          Reply
        </Button>

        {isReplying ? (
          <div className='grid w-full gap-1.5'>
            <Label htmlFor='reply'>Your reply</Label>

            <div className='mt-2'>
              <Textarea
                id='reply'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder='What are your thoughts?'
                className='resize-none'
              />

              <div className='flex justify-end gap-2 mt-2'>
                <Button
                  tabIndex={-1}
                  variant='subtle'
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>

                <Button
                  isLoading={isLoading}
                  disabled={!input}
                  onClick={() => {
                    if (!input) return;

                    postReply({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
