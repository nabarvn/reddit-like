"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "@/components";
import { Button, Input } from "@/components/ui";
import { ImageIcon, Link2 } from "lucide-react";

interface MiniCreatePostProps {
  session: Session | null;
}

const MiniCreatePost = ({ session }: MiniCreatePostProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <li className='overflow-hidden rounded-lg bg-white shadow h-full'>
      <div className='flex justify-between gap-3 lg:gap-6 h-fit px-3 lg:px-6 py-2 lg:py-4'>
        <div className='relative h-fit'>
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />

          <span className='absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white' />
        </div>

        <Input
          readOnly
          onClick={() => router.push(pathname + "/submit")}
          placeholder='Create post'
        />

        <Button
          variant='ghost'
          onClick={() => router.push(pathname + "/submit")}
          className='px-2 md:px-4 py-1 md:py-2'
        >
          <ImageIcon className='text-zinc-600' />
        </Button>

        <Button
          variant='ghost'
          onClick={() => router.push(pathname + "/submit")}
          className='px-2 md:px-4 py-1 md:py-2'
        >
          <Link2 className='text-zinc-600' />
        </Button>
      </div>
    </li>
  );
};

export default MiniCreatePost;
