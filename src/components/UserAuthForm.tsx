"use client";

import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icons } from "@/components";
import { useToast } from "@/hooks";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}
// HTMLDivElement is a generic which is like an argument type passed through the fn

const UserAuthForm = ({ className, ...props }: UserAuthFormProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn("google");
    } catch (error) {
      // toast notification
      toast({
        title: "There was a problem",
        description: "An error occurred while logging in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        onClick={loginWithGoogle}
        isLoading={isLoading}
        size='sm'
        className='w-full'
      >
        {isLoading ? null : <Icons.google className='h-4 w-4 mr-2' />}
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;
