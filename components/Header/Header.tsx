// components/Header/Header.tsx

import CategoriesMenu from "../CategoriesMenu/CategoriesMenu";
import Link from "next/link";
import AuthNavigation from "../AuthNavigation/AuthNavigation";

const Header = async () => {
  // const categories = await getCategories();

  return (
    <header>
      <Link
        href="/"
        aria-label="Home">
        NoteHub
      </Link>
      <nav aria-label="Main Navigation">
        <ul>
          <li>
            <CategoriesMenu />
          </li>
          <li>
            <Link href="/profile">Profile</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <AuthNavigation />
        </ul>
      </nav>
    </header>
  );
};

export default Header;
