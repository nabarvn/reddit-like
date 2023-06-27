import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

type UserId = string | null | undefined;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    username: string | null | undefined;
  }
}

declare module "next-auth" {
  interface Session {
    id: UserId;
    username: string | null | undefined;
  }
}
