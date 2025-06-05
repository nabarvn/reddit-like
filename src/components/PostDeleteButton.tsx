"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { PostDeletionRequest } from "@/lib/validators/post";

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

interface PostDeleteButtonProps {
  postId: string;
}

const PostDeleteButton: FC<PostDeleteButtonProps> = ({ postId }) => {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);

  const { mutate: deletePost, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: PostDeletionRequest = {
        postId,
      };

      const { data } = await axios.delete(
        `/api/subreddit/post/delete?postId=${payload.postId}`
      );

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return toast({
            title: "Unauthorized",
            description: "You are not authorized to delete this post.",
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
      router.push("/");
      router.refresh();

      toast({
        title: "Success!",
        description: "Your post has been deleted.",
      });
    },
  });

  return (
    <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <DialogTrigger asChild>
        <button
          className={buttonVariants({
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
            This action cannot be undone and will permanently delete your post.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-y-2">
          <Button variant="ghost" onClick={() => setShowDeleteAlert(false)}>
            Cancel
          </Button>

          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              deletePost();
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

export default PostDeleteButton;
