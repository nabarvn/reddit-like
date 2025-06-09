"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import useCustomToast from "@/hooks/use-custom-toast";

const CreateCommunityPage = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const { loginToast } = useCustomToast();

  const { mutate: createCommunity, isLoading } = useMutation({
    // handles data fetching logic
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      };

      const { data } = await axios.post("/api/subreddit", payload);

      return data as string;
    },
    // error handling
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Subreddit already exists",
            description: "Please come up with a different community name.",
            variant: "destructive",
          });
        }

        if (err.response?.status === 422) {
          return toast({
            title: "Invalid subreddit name",
            description: err.response?.data,
            variant: "destructive",
          });
        }

        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      toast({
        title: "There was an error",
        description: "Could not create community.",
        variant: "destructive",
      });
    },
    // success handling
    onSuccess: (data) => {
      router.push(`/r/${data}`);
    },
  });

  return (
    <div className="md:container flex items-center h-full max-w-3xl mx-auto px-5">
      <div className="relative bg-white w-full h-fit rounded-lg space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a community</h1>
        </div>

        <hr className="bg-zinc-500 h-px" />

        <div>
          <p className="text-lg font-medium">Name</p>

          <p className="text-xs pb-2">Community names cannot be changed.</p>

          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              r/
            </p>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="subtle" onClick={() => router.back()}>
            Cancel
          </Button>

          <Button
            onClick={() => createCommunity()}
            isLoading={isLoading}
            disabled={!input}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityPage;
