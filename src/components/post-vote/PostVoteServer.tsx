import { Session } from "next-auth";
import { VoteType } from "@prisma/client";
import PostVoteClient from "./PostVoteClient";

interface PostVoteServerProps {
  session: Session | null;
  postId: string;
  initialPostVotesAmount: number;
  initialPostVote?: VoteType;
}

const PostVoteServer = async ({
  postId,
  initialPostVotesAmount,
  initialPostVote,
}: PostVoteServerProps) => {
  // Any method involving `authOptions` throws an error in a server component which is not `page.tsx` or `layout.tsx`
  // const session = await getServerSession();   -> OK
  // const session = await getServerSession(authOptions);   -> ERROR
  // const session = await getAuthSession();   -> ERROR

  return (
    <PostVoteClient
      postId={postId}
      initialPostVotesAmount={initialPostVotesAmount}
      initialPostVote={initialPostVote}
    />
  );
};

export default PostVoteServer;
