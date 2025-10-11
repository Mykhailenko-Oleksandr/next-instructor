import { getCategories } from "@/lib/api/clientApi";
import Link from "next/link";

const NotesSidebar = async () => {
  const categories = await getCategories();

  return (
    <>
      <Link href="/notes/action/create">Create note</Link>
      <ul>
        <li>
          <Link href={`/notes/filter/all`}>All notes</Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/notes/filter/${category.id}`}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default NotesSidebar;
