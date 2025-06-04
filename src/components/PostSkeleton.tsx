import { Skeleton } from "./ui/Skeleton";

const PostSkeleton = () => {
  return (
    <div className="rounded-md bg-white shadow">
      <div className="flex justify-between px-3 md:px-6 py-4">
        <div className="flex-col items-center hidden md:flex">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-12 w-1 mt-2 rounded-lg" />
          <Skeleton className="h-6 w-6 mt-2 rounded-full" />
        </div>

        <div className="w-0 flex-1 ml-3 md:ml-6">
          <div className="flex items-center max-h-40 text-xs text-gray-500">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-40 ml-2 rounded-lg hidden md:block" />
          </div>

          <div className="py-2">
            <Skeleton className="h-6 w-1/2 rounded-lg" />
          </div>

          <div className="relative text-sm max-h-40 w-full overflow-clip">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <Skeleton className="h-6 w-1/4 rounded-lg" />
      </div>
    </div>
  );
};

export default PostSkeleton;
