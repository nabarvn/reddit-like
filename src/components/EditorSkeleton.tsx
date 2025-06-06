import { Skeleton } from "./ui/Skeleton";

const EditorSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-y-4 pt-4">
      <Skeleton className="h-4 w-2/5 rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-4/5 rounded-lg" />
    </div>
  );
};

export default EditorSkeleton;
