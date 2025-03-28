import { fetchPersonas, fetchUserChatById } from "@/data";
import PersonasList from "./PersonasList";

// 关闭 SSG，否则 build 环境会读取数据库
export const dynamic = "force-dynamic";

// type PageProps = {
//   searchParams?: { scoutUserChat?: string };
// };

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ scoutUserChat?: string }>;
}) {
  const userChatParam = (await searchParams)?.scoutUserChat;
  if (userChatParam) {
    const scoutUserChatId = parseInt(userChatParam);
    const scoutUserChat = await fetchUserChatById(scoutUserChatId, "scout");
    const personas = await fetchPersonas(scoutUserChatId);
    return <PersonasList personas={personas} scoutUserChat={scoutUserChat} />;
  } else {
    const personas = await fetchPersonas();
    return <PersonasList personas={personas} />;
  }
}
