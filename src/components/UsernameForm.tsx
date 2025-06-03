"use client";

import * as React from "react";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

import { Button, Card, Input, Label } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  UsernameUpdateRequest,
  UsernameValidator,
} from "@/lib/validators/username";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

interface UsernameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, "id" | "username">;
}

const UsernameForm = ({ user, className, ...props }: UsernameFormProps) => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameUpdateRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameUpdateRequest) => {
      const payload: UsernameUpdateRequest = { name };

      const { data } = await axios.patch(`/api/username/`, payload);

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken",
            description: "Please choose another handle.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Something went wrong",
        description: "Your username was not updated, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your username has been updated.",
      });

      router.refresh();
    },
  });

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit((e) => updateUsername(e))}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>

          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              Name
            </Label>

            <Input
              id="name"
              className="w-[200px] md:w-[300px] pl-6"
              size={32}
              {...register("name")}
            />

            {errors?.name && (
              <p className="text-xs text-red-600 px-1 pt-1">
                {errors.name.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Update</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UsernameForm;
