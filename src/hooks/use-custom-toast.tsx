import Link from "next/link";
import { toast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";

const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "Login required",
      description: "Please sign in to perform this action.",
      variant: "destructive",
      action: (
        <Link
          href="/sign-in"
          onClick={() => dismiss()}
          className={buttonVariants({
            variant: "outline",
          })}
        >
          Login
        </Link>
      ),
    });
  };

  return { loginToast };
};

export default useCustomToast;
