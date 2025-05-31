"use client";

import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import useCustomToast from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialPostVotesAmount: number;
  initialPostVote?: VoteType | null;
}

const PostVoteClient = ({
  postId,
  initialPostVotesAmount,
  initialPostVote,
}: PostVoteClientProps) => {
  const [isCooldown, setIsCooldown] = useState<boolean>(false);

  const [postVotesAmount, setPostVotesAmount] = useState<number>(
    initialPostVotesAmount
  );

  const [currentPostVote, setCurrentPostVote] = useState<
    VoteType | null | undefined
  >(initialPostVote);

  const { loginToast } = useCustomToast();
  const prevPostVote = usePrevious(currentPostVote);

  // to make sure that the server and client are in sync when it comes to the value of `initialPostVote`
  useEffect(() => {
    setCurrentPostVote(initialPostVote);
  }, [initialPostVote]);

  const { mutate: postVoter, isLoading } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") {
        setPostVotesAmount((prev) => prev - 1);
      } else {
        setPostVotesAmount((prev) => prev + 1);
      }

      // reset current post vote color
      setCurrentPostVote(prevPostVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong",
        description: "Your vote was not registered, please try again.",
        variant: "destructive",
      });
    },
    onMutate: (voteType: VoteType) => {
      if (currentPostVote === voteType) {
        // when user clicks the same post vote button
        setCurrentPostVote(undefined);

        if (voteType === "UP") {
          setPostVotesAmount((prev) => prev - 1);
        } else {
          setPostVotesAmount((prev) => prev + 1);
        }
      } else {
        // when user clicks the opposite post vote button
        setCurrentPostVote(voteType);

        if (voteType === "UP") {
          setPostVotesAmount((prev) => prev + (currentPostVote ? 2 : 1));
        } else {
          setPostVotesAmount((prev) => prev - (currentPostVote ? 2 : 1));
        }
      }
    },
  });

  const handleVote = (voteType: VoteType) => {
    if (isCooldown) return;
    setIsCooldown(true);
    postVoter(voteType);

    setTimeout(() => setIsCooldown(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-0 sm:w-20 pr-3 md:pr-6 pb-4 sm:pb-0">
      <Button
        size="sm"
        variant="ghost"
        aria-label="upvote"
        onClick={() => handleVote("UP")}
        disabled={isLoading}
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentPostVote === "UP",
          })}
        />
      </Button>

      <p className="text-center font-medium text-sm text-zinc-900 py-2">
        {postVotesAmount}
      </p>

      <Button
        size="sm"
        variant="ghost"
        aria-label="downvote"
        onClick={() => handleVote("DOWN")}
        disabled={isLoading}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentPostVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
