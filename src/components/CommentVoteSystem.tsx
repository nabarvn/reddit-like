"use client";

import { Button } from "@/components/ui";
import useCustomToast from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useEffect, useState } from "react";

interface CommentVoteSystemProps {
  commentId: string;
  initialCommentVotesAmount: number;
  initialCommentVote?: VoteType | null;
}

const CommentVoteSystem = ({
  commentId,
  initialCommentVotesAmount,
  initialCommentVote,
}: CommentVoteSystemProps) => {
  const [commentVotesAmount, setCommentVotesAmount] = useState<number>(
    initialCommentVotesAmount
  );

  const [currentCommentVote, setCurrentCommentVote] = useState<
    VoteType | null | undefined
  >(initialCommentVote);

  const { loginToast } = useCustomToast();
  const prevCommentVote = usePrevious(currentCommentVote);

  // to make sure that the server and client are in sync when it comes to the value of `initialPostVote`
  useEffect(() => {
    setCurrentCommentVote(initialCommentVote);
  }, [initialCommentVote]);

  const { mutate: commentVoter } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") {
        setCommentVotesAmount((prev) => prev - 1);
      } else {
        setCommentVotesAmount((prev) => prev + 1);
      }

      // reset current comment vote color
      setCurrentCommentVote(prevCommentVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Your vote was not registered, please try again.",
        variant: "destructive",
      });
    },
    onMutate: (voteType: VoteType) => {
      if (currentCommentVote === voteType) {
        // when user clicks the same comment vote button
        setCurrentCommentVote(undefined);

        if (voteType === "UP") {
          setCommentVotesAmount((prev) => prev - 1);
        } else {
          setCommentVotesAmount((prev) => prev + 1);
        }
      } else {
        // when user clicks the opposite comment vote button
        setCurrentCommentVote(voteType);

        if (voteType === "UP") {
          setCommentVotesAmount((prev) => prev + (currentCommentVote ? 2 : 1));
        } else {
          setCommentVotesAmount((prev) => prev - (currentCommentVote ? 2 : 1));
        }
      }
    },
  });

  return (
    <div className='flex gap-1'>
      <Button
        size='xs'
        variant='ghost'
        aria-label='upvote'
        onClick={() => commentVoter("UP")}
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentCommentVote === "UP",
          })}
        />
      </Button>

      <p className='text-center font-medium text-sm text-zinc-900 p-2'>
        {commentVotesAmount}
      </p>

      <Button
        size='xs'
        variant='ghost'
        aria-label='downvote'
        onClick={() => commentVoter("DOWN")}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentCommentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVoteSystem;
