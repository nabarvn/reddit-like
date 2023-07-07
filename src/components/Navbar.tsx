import Link from "next/link";
import { ProfileMenu, Icons, SearchBar } from "@/components";
import { getServerSession } from "next-auth";
import { buttonVariants } from "./ui/Button";

const Navbar = async () => {
  const session = await getServerSession();

  return (
    <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2'>
      <div className='md:container max-w-7xl h-full mx-auto flex items-center justify-between gap-2 px-5'>
        {/* logo */}
        <Link href='/' className='flex gap-2 items-center'>
          <Icons.logo className='h-7 w-7' />

          <p className='hidden text-zinc-700 text-sm font-medium md:block'>
            Reddit-Like
          </p>
        </Link>

        {/* search bar */}
        <SearchBar />

        {session ? (
          <ProfileMenu user={session.user!} />
        ) : (
          <Link href='/sign-in' className={buttonVariants({ size: "sm" })}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
