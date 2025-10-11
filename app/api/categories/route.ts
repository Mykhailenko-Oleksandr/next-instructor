// app/api/categories/route.ts

import { NextResponse } from "next/server";
import { api, ApiError } from "../api";

export async function GET() {
  try {
    const { data } = await api("/categories"); // Повертаємо те, що відповів бекенд через метод json

    return NextResponse.json(data);
  } catch (error) {
    // У випадку помилки — повертаємо обʼєкт з помилкою
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
