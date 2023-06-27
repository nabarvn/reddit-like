import "@/styles/globals.css";

// import { Navbar } from "@/components";
import { Toaster } from "@/components/ui";

import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

import Link from "next/link";
import Icons from "@/components/Icons";
import ProfileMenu from "@/components/ProfileMenu";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";

export const metadata = {
  title: "Reddit-Like",
  description:
    "A web app built with Next.js and TypeScript that functions like Reddit.",
};

const inter = Inter({ subsets: ["latin"] });

const RootLayout = async ({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) => {
  const session = await getAuthSession();

  return (
    <html
      lang='en'
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body className='min-h-screen bg-slate-50 antialiased pt-12'>
        {/* navbar */}
        <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2'>
          <div className='container max-w-7xl h-full mx-auto flex items-center justify-between gap-2'>
            {/* logo */}
            <Link href='/' className='flex gap-2 items-center'>
              <Icons.logo className='h-7 w-7' />
              <p className='hidden text-zinc-700 text-sm font-medium md:block'>
                Reddit-Like
              </p>
            </Link>

            {/* search bar */}

            {session ? (
              <ProfileMenu user={session.user!} />
            ) : (
              <Link href='/sign-in' className={buttonVariants({ size: "sm" })}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* intercepting route child */}
        {authModal}

        {/* pages */}
        <div className='container max-w-7xl mx-auto h-full pt-12'>
          {children}
        </div>

        {/* pop-up notification */}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
