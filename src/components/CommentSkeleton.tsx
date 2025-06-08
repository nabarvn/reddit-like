import { Skeleton } from "./ui/Skeleton";

const CommentSkeleton = () => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <Skeleton className="h-6 w-6 rounded-full" />

        <div className="flex items-center gap-x-1 ml-2">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-y-2 mt-2 ml-8">
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-lg" />
        <Skeleton className="h-4 w-2/5 rounded-lg" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2 ml-8">
        <Skeleton className="h-8 w-14 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
};

export default CommentSkeleton;
