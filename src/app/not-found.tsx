import { FC } from "react";
import Link from "next/link";
import { Balancer } from "react-wrap-balancer";

import { buttonVariants } from "@/components/ui/Button";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const NotFound: FC = ({}) => {
  return (
    <div className="flex items-center justify-center h-full px-5">
      <Card className="max-w-xl w-full bg-transparent border-none shadow-none text-center py-6">
        <CardHeader>
          <CardTitle>404 - Page Not Found</CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            <Balancer>The page you are looking for does not exist.</Balancer>
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href="/" className={buttonVariants()}>
            Go back home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
