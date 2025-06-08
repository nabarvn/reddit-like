"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { Button, Label, Textarea } from "@/components/ui";
import useCustomToast from "@/hooks/use-custom-toast";
import { CommentRequest } from "@/lib/validators/comment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment = ({ postId, replyToId }: CreateCommentProps) => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState<string>("");
  const { loginToast } = useCustomToast();

  const { mutate: postComment, isLoading } = useMutation({
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
        description: "Could not post comment, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
      setInput("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>

      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
          className="resize-none"
        />

        <div className="flex justify-end mt-2">
          <Button
            isLoading={isLoading}
            disabled={!input}
            onClick={() => {
              if (!input) return;
              postComment({ postId, text: input, replyToId });
            }}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
