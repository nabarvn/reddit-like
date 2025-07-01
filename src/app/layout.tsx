import "@/styles/globals.css";

import { Navbar, Providers } from "@/components";
import { Toaster } from "@/components/ui";

import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

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
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light hydrated",
        inter.className
      )}
    >
      <body
        className="bg-slate-50 antialiased pt-[60px]"
        style={{ height: "100svh" }}
      >
        <Providers>
          {/* navbar */}
          {/* @ts-expect-error server component */}
          <Navbar />

          {/* intercepting route child */}
          {authModal}

          {/* pages */}
          <div className="mx-auto h-full overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-300 lg:scrollbar-thumb-rounded-sm pb-12">
            {children}
          </div>

          {/* pop-up notification */}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
