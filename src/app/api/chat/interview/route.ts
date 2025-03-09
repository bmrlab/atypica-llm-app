export async function POST(req: Request) {
  const { messages } = await req.json();
  return messages;
}
