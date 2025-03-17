import { fetchPersonas, fetchUserScoutChatById } from "@/data";
import PersonasList from "./PersonasList";

// 关闭 SSG，否则 build 环境会读取数据库
export const dynamic = "force-dynamic";

export default async function PersonasPage({
  searchParams,
}: {
  searchParams?: { userScoutChat?: string };
}) {
  if (searchParams?.userScoutChat) {
    const userScoutChatId = parseInt(searchParams.userScoutChat);
    const userScoutChat = await fetchUserScoutChatById(userScoutChatId);
    const personas = await fetchPersonas(userScoutChatId);
    return <PersonasList personas={personas} userScoutChat={userScoutChat} />;
  } else {
    const personas = await fetchPersonas();
    return <PersonasList personas={personas} />;
  }
}
