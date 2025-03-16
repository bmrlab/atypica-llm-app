import "next-auth";

declare module "next-auth" {
  interface User {
    id: number;
    email: string;
  }
  interface Session {
    user?: {
      id: number;
      email: string;
    };
    expires: ISODateString;
  }
}
