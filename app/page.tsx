import Image from "next/image";

export default function Home() {
  return (
    <section>
      <h1>Home</h1>
      {/* <Image
        src="/hero.jpg"
        alt="hero"
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        placeholder="blur"
      /> */}
      <Image
        src="https://picsum.photos/seed/picsum/300/300"
        alt="test"
        width={300}
        height={300}
        priority
      />
    </section>
  );
}
