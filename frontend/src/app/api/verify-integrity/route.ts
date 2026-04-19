import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/backend";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(buildBackendUrl("/api/verify-integrity"), {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body,
      cache: "no-store"
    });
    const payload = await response.text();

    if (!payload.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "GreenProof integrity service returned an empty response."
        },
        { status: 502 }
      );
    }

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "content-type": "application/json"
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "GreenProof integrity service is unavailable right now."
      },
      { status: 502 }
    );
  }
}
