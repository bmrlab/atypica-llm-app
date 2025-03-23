import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/.ping",
};

function handlePingRequest(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const region = process.env.DEPLOY_REGION;
  const headers = Object.fromEntries(req.headers);
  return new NextResponse(JSON.stringify({ path, region, headers }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.endsWith(".ping")) {
    return handlePingRequest(req);
  }

  return NextResponse.next();
}
