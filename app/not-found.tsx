// import Link from "next/link";

// const NotFound = () => {
//   return (
//     <div>
//       <h1>404 - Page Not Found</h1>
//       <p>Sorry, the page you&#39;re looking for doesn&#39;t exist.</p>
//       <Link href="/">Go back home</Link>
//     </div>
//   );
// };

// export default NotFound;

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    // Редірект через 3 секунди
    const timer = setTimeout(() => router.push("/"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div>
      <h1>404 - Сторінку не знайдено</h1>
      <p>Вас буде перенаправлено на головну через кілька секунд…</p>
    </div>
  );
};

export default NotFound;
