import { fetchPersonas, fetchUserScoutChatById } from "@/data";
import PersonasList from "./PersonasList";

// 关闭 SSG，否则 build 环境会读取数据库
export const dynamic = "force-dynamic";

// type PageProps = {
//   searchParams?: { userScoutChat?: string };
// };

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ userScoutChat?: string }>;
}) {
  const userScoutChatParam = (await searchParams)?.userScoutChat;
  if (userScoutChatParam) {
    const userScoutChatId = parseInt(userScoutChatParam);
    const userScoutChat = await fetchUserScoutChatById(userScoutChatId);
    const personas = await fetchPersonas(userScoutChatId);
    return <PersonasList personas={personas} userScoutChat={userScoutChat} />;
  } else {
    const personas = await fetchPersonas();
    return <PersonasList personas={personas} />;
  }
}
