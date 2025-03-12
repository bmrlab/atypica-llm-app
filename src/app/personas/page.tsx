import { fetchAllPersonas } from "./data";
import PersonasList from "./PersonasList";

export default async function PersonasPage() {
  const personas = await fetchAllPersonas();
  return <PersonasList personas={personas} />;
}
