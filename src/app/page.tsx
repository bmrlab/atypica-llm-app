import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import HomePageClient from "./home/HomePageClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return <HomePageClient anonymous={!session?.user} />;
}
