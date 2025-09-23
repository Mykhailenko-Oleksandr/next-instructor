"use client";

type Props = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div>
      <h2>Помилка при завантаженні</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Спробувати знову</button>
    </div>
  );
}
