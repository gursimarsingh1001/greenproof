import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/backend";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const response = await fetch(buildBackendUrl(`/api/brand/${id}/reputation`), {
      cache: "no-store"
    });
    const payload = await response.text();

    if (!payload.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "GreenProof brand reputation service returned an empty response."
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
        error: "GreenProof brand reputation service is unavailable right now."
      },
      { status: 502 }
    );
  }
}
