"use client";

import useCustomToast from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className='flex sm:flex-col gap-4 sm:gap-0 sm:w-20 pr-6 pb-4 sm:pb-0'>
      <Button size='sm' variant='ghost' aria-label='upvote'>
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentPostVote === "UP",
          })}
        />
      </Button>

      <p className='text-center font-medium text-sm text-zinc-900 py-2'>
        {postVotesAmount}
      </p>

      <Button size='sm' variant='ghost' aria-label='downvote'>
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
