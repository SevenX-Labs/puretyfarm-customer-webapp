import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-puretyfarm.onrender.com"
).replace(/\/+$/, "");

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetPath = `/api/v1/${path.join("/")}`;
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${targetPath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower !== "host" &&
      lower !== "connection" &&
      lower !== "content-length" &&
      lower !== "transfer-encoding"
    ) {
      headers.set(key, value);
    }
  });

  const method = req.method;
  let body: ArrayBuffer | undefined = undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.arrayBuffer();
    } catch {}
  }

  try {
    const res = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await res.arrayBuffer();
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // fetch() has already decompressed the body, so the upstream
      // Content-Encoding/Content-Length no longer describe `data`.
      // Forwarding them makes the browser try to gunzip plain bytes
      // -> ERR_CONTENT_DECODING_FAILED.
      if (
        lower === "content-encoding" ||
        lower === "content-length" ||
        lower === "transfer-encoding"
      ) {
        return;
      }
      responseHeaders.set(key, value);
    });

    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy Error] ${method} ${targetUrl}:`, err);
    return NextResponse.json(
      {
        error: "Backend Service Unavailable",
        message: err?.message || "Could not connect to backend server.",
        statusCode: 502,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
