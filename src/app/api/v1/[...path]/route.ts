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

  if (body) {
    headers.set("content-length", String(body.byteLength));
  }
  // Strip accept-encoding so upstream response is not compressed and decoded twice
  headers.delete("accept-encoding");
  headers.set("connection", "keep-alive");

  try {
    const res = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    // When a customer has no profile yet (e.g. during onboarding), the backend returns 404.
    // Return 200 with null so the browser console does not log a 404 error for a normal new user state.
    if (res.status === 404 && targetPath.startsWith("/api/v1/customer/profile/me")) {
      return NextResponse.json(null);
    }

    // When a customer has no active delivery plan, the backend returns 404.
    // Return 200 with activePlan: null so the browser console does not log a 404 error for a normal state.
    if (res.status === 404 && targetPath.startsWith("/api/v1/customer/manage-delivery")) {
      return NextResponse.json({
        activePlan: null,
        upcomingDeliveries: [],
      });
    }

    // When a customer has no saved addresses, if the backend returns 404, return [] cleanly.
    if (res.status === 404 && targetPath.startsWith("/api/v1/customer/addresses")) {
      return NextResponse.json([]);
    }

    // Rate limit handling for auth login/send-otp:
    // Translate 429 into a clean 200 response with error details so the browser console does not emit unhandled 429 errors.
    if (res.status === 429 && targetPath.startsWith("/api/v1/auth/customer/login")) {
      const retryAfter = res.headers.get("retry-after") || "60";
      return NextResponse.json({
        success: false,
        statusCode: 429,
        error: "Too many OTP requests. Please wait a minute before requesting another code.",
        message: "Too many OTP requests. Please wait a minute before requesting another code.",
        remainingCooldown: parseInt(retryAfter, 10) || 60,
      });
    }

    // Rejection handling for OTP verification (invalid or expired OTP):
    // Translate 400 into a clean 200 response with success: false so the browser console does not log an unhandled 400 error.
    if (res.status === 400 && targetPath.startsWith("/api/v1/auth/customer/verify-otp")) {
      let message = "Invalid or expired OTP. Please request a new one.";
      try {
        const errJson = (await res.json()) as { message?: string | string[] };
        if (errJson?.message) {
          message = Array.isArray(errJson.message) ? errJson.message.join(", ") : String(errJson.message);
        }
      } catch {}
      return NextResponse.json({
        success: false,
        statusCode: 400,
        error: message,
        message,
      });
    }

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
