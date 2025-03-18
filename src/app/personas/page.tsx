import { fetchPersonas, fetchUserChatById } from "@/data";
import PersonasList from "./PersonasList";

// 关闭 SSG，否则 build 环境会读取数据库
export const dynamic = "force-dynamic";

// type PageProps = {
//   searchParams?: { userChat?: string };
// };

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ userChat?: string }>;
}) {
  const userChatParam = (await searchParams)?.userChat;
  if (userChatParam) {
    const userChatId = parseInt(userChatParam);
    const userChat = await fetchUserChatById(userChatId);
    const personas = await fetchPersonas(userChatId);
    return <PersonasList personas={personas} userChat={userChat} />;
  } else {
    const personas = await fetchPersonas();
    return <PersonasList personas={personas} />;
  }
}
