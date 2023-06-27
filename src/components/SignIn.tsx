import { Icons, UserAuthForm } from "@/components";
import Link from "next/link";

const SignIn = () => {
  return (
    <div className='container mx-auto flex flex-col w-full justify-center space-y-6 sm:w-[400px]'>
      <div className='flex flex-col space-y-2 text-center'>
        <Icons.logo className='mx-auto h-6 w-6' />
        <h1 className='text-2xl font-semibold tracking-tight'>Welcome back!</h1>
        <p className='text-sm max-w-sm mx-auto'>
          By continuing, you are setting up a Reddit-Like account and agree to
          our User Agreement and Privacy Policy.
        </p>

        {/* sign-in form */}
        <UserAuthForm />

        <p className='text-center text-sm text-zinc-700 px-8'>
          New to Reddit-Like?{" "}
          <Link
            href='/sign-up'
            className='text-sm hover:text-zinc-800 underline underline-offset-4'
          >
            Sign Up!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
