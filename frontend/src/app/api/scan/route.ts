import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(buildBackendUrl("/api/scan"), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body,
    cache: "no-store"
  });
  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "content-type": "application/json"
    }
  });
}
