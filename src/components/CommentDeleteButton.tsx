"use client";

import { FC, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { CommentDeletionRequest } from "@/lib/validators/comment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { Button, buttonVariants } from "./ui/Button";
import { Trash } from "lucide-react";

interface CommentDeleteButtonProps {
  commentId: string;
}

const CommentDeleteButton: FC<CommentDeleteButtonProps> = ({ commentId }) => {
  const queryClient = useQueryClient();
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);

  const { mutate: deleteComment, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CommentDeletionRequest = {
        commentId,
      };

      const { data } = await axios.delete(
        `/api/subreddit/post/comment/delete?commentId=${payload.commentId}`
      );

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return toast({
            title: "Unauthorized",
            description: "You are not authorized to delete this comment.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "There was a problem",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
      setShowDeleteAlert(false);

      toast({
        title: "Success!",
        description: "Your comment has been deleted.",
      });
    },
  });

  return (
    <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <DialogTrigger asChild>
        <button
          className={buttonVariants({
            size: "xs",
            variant: "ghost",
          })}
        >
          <Trash className="w-4 h-4" />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sure you want to delete?</DialogTitle>

          <DialogDescription>
            This action cannot be undone and will permanently delete your
            comment.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-y-2">
          <Button variant="ghost" onClick={() => setShowDeleteAlert(false)}>
            Cancel
          </Button>

          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              deleteComment();
            }}
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDeleteButton;
