import { Post, PostVote } from "@prisma/client";
import { Session } from "next-auth";
import { notFound } from "next/navigation";
import PostVoteClient from "./PostVoteClient";

type PartialPostVote = Pick<PostVote, "type">;

type ExtendedData = Post & { postVotes: PostVote[] };

interface PostVoteServerProps {
  session: Session | null;
  postId: string;
  initialPostVotesAmount: number;
  initialPostVote?: PartialPostVote;
  getData?: () => Promise<ExtendedData | null>;
}

const PostVoteServer = async ({
  session,
  postId,
  initialPostVotesAmount,
  initialPostVote,
  getData,
}: PostVoteServerProps) => {
  // Any method involving `authOptions` throws an error in a server component which is not `page.tsx` or `layout.tsx`
  // const session = await getServerSession();   -> OK
  // const session = await getServerSession(authOptions);   -> ERROR
  // const session = await getAuthSession();   -> ERROR

  // declare as mutable elements so that a conditional check can be performed on them
  let postVotesAmount: number = 0;
  let currentPostVote: PartialPostVote | undefined = undefined;

  if (getData) {
    // make a db call
    const post = await getData();
    if (!post) return notFound();

    postVotesAmount = post.postVotes.reduce((acc, postVote) => {
      if (postVote.type === "UP") return acc + 1;
      if (postVote.type === "DOWN") return acc - 1;

      return acc;
    }, 0);

    currentPostVote = post.postVotes.find(
      (postVote) => postVote.userId === session?.user.id
    );
  } else {
    // render almost immediately
    postVotesAmount = initialPostVotesAmount;
    currentPostVote = initialPostVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialPostVotesAmount={postVotesAmount}
      initialPostVote={currentPostVote?.type}
    />
  );
};

export default PostVoteServer;
