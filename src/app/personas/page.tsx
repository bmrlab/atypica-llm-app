import { fetchPersonas } from "@/data";
import PersonasList from "./PersonasList";

// 关闭 SSG，否则 build 环境会读取数据库
export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  const personas = await fetchPersonas();
  return <PersonasList personas={personas} />;
}
