// lib/api/serverApi.ts

import { cookies } from "next/headers";
import { nextServer } from "./api";
import { User } from "./clientApi";

export const checkServerSession = async () => {
  // Дістаємо поточні cookie
  const cookieStore = await cookies();
  const res = await nextServer.get("/auth/session", {
    headers: {
      // передаємо кукі далі
      Cookie: cookieStore.toString(),
    },
  });
  // Повертаємо повний респонс, щоб middleware мав доступ до нових cookie
  return res;
};

export const getServerMe = async (): Promise<User> => {
  const cookieStore = await cookies();
  const { data } = await nextServer.get("/auth/me", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return data;
};
