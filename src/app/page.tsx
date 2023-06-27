import { HomeIcon } from "lucide-react";

const Home = () => {
  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl'>Your Feed</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
        {/* feed */}

        {/* subreddit info */}
        <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
          <div className='bg-emerald-100 px-6 py-4'>
            <p className='font-semibold flex items-center gap-1.5 py-3'>
              <HomeIcon className='h-4 w-4' />
              Home
            </p>
          </div>

          <div className='-my-3 divide-y divide-gray-100 text-sm leading-6 px-6 py-4'>
            <div className='flex justify-between gap-x-4 py-3'>
              <p className='text-zinc-500'>
                This is where you can stay connected with your favorite
                communities. Join us to check in!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
