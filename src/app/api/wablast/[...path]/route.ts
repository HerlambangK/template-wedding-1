import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.WABLAST_API_URL || "https://wb.aali.my.id";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, await params);
}

async function proxy(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join("/");
  const targetUrl = `${API_BASE}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

  const contentType = req.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  let body: BodyInit | null = null;

  if (["POST", "PATCH", "PUT"].includes(req.method) && req.body) {
    if (isMultipart) {
      body = await req.formData();
    } else if (contentType.includes("application/json")) {
      body = JSON.stringify(await req.json());
    } else {
      body = await req.text();
    }
  }

  if (!isMultipart) {
    headers.set("Content-Type", contentType || "application/json");
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      duplex: body ? "half" : undefined,
    } as RequestInit);

    const resContentType = res.headers.get("content-type") || "";
    const isJson = resContentType.includes("application/json");
    const resBody = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      console.error(`[WABLAST PROXY] ${req.method} ${targetUrl} → ${res.status}`, typeof resBody === "string" ? resBody.slice(0, 500) : resBody);
      const message =
        typeof resBody === "object" && resBody !== null && "message" in resBody
          ? (resBody as { message: string }).message
          : String(resBody);
      return NextResponse.json(
        { message, code: String(res.status), _proxy_url: targetUrl },
        { status: res.status }
      );
    }

    if (isJson) {
      return NextResponse.json(resBody, { status: res.status });
    }

    return new NextResponse(resBody, {
      status: res.status,
      headers: { "Content-Type": resContentType },
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Proxy error" },
      { status: 502 }
    );
  }
}
