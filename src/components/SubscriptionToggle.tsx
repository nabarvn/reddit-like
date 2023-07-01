"use client";

import { Button } from "@/components/ui";
import { SubscribeToSubredditPayload } from "@/lib/validators/subreddit";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import useCustomToast from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

interface SubscriptionToggleProps {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
}

const SubscriptionToggle = ({
  subredditId,
  subredditName,
  isSubscribed,
}: SubscriptionToggleProps) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  // for subscribing
  const { mutate: subscribe, isLoading: isSubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/subscribe", payload);

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // refresh current page
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Joined successfully!",
        description: `You are now subscribed to r/${subredditName}`,
      });
    },
  });

  // for unsubscribing
  const { mutate: unsubscribe, isLoading: isUnsubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/unsubscribe", payload);

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // refresh current page
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Left community successfully!",
        description: `You are now unsubscribed from r/${subredditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      onClick={() => unsubscribe()}
      isLoading={isUnsubscribing}
      variant='default'
      className='w-full mt-3'
    >
      Leave
    </Button>
  ) : (
    <Button
      onClick={() => subscribe()}
      isLoading={isSubscribing}
      variant='default'
      className='w-full mt-3'
    >
      Join
    </Button>
  );
};

export default SubscriptionToggle;
