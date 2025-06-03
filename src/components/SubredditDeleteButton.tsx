"use client";

import { FC, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { DeleteSubredditPayload } from "@/lib/validators/subreddit";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { Button } from "./ui/Button";

interface SubredditDeleteButtonProps {
  subredditId: string;
}

const SubredditDeleteButton: FC<SubredditDeleteButtonProps> = ({
  subredditId,
}) => {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);

  const { mutate: deleteSubreddit, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: DeleteSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.delete("/api/subreddit/delete", {
        data: payload,
      });

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return toast({
            title: "Unauthorized",
            description: "You are not authorized to delete this subreddit.",
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
      setShowDeleteAlert(false);

      router.push("/");
      router.refresh();

      toast({
        title: "Success!",
        description: "The subreddit has been deleted.",
      });
    },
  });

  return (
    <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full mt-2">
          Delete Subreddit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sure you want to delete?</DialogTitle>

          <DialogDescription>
            This action cannot be undone and will permanently delete this
            subreddit.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowDeleteAlert(false)}>
            Cancel
          </Button>

          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              deleteSubreddit();
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

export default SubredditDeleteButton;
