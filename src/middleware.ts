import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|_public|favicon.ico|sitemap.xml|robots.txt).*)"],
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

function handleLocale(req: NextRequest) {
  // Get the locale from cookies
  const localeCookie = req.cookies.get("locale");
  const locale = localeCookie?.value || "zh-CN";
  // Create a response object from the request
  const response = NextResponse.next();
  // Set the locale in a header to be accessible in server components
  response.headers.set("x-locale", locale);
  return response;
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.endsWith(".ping")) {
    return handlePingRequest(req);
  }

  const response = handleLocale(req);

  return response;
}
