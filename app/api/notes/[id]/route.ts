// app/api/notes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { api, ApiError } from "../../api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;
  try {
    const { data } = await api(`/notes/${id}`);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          (error as ApiError).response?.data?.error ??
          (error as ApiError).message,
      },
      { status: (error as ApiError).status }
    );
  }
}
