"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import css from "./CategoriesMenu.module.css";
import { Category, getCategories } from "@/lib/api/clientApi";

const CategoriesMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  // Додаємо стан
  const [categories, setCategories] = useState<Category[]>([]);

  // Додаємо ефект для запиту
  useEffect(() => {
    // Змінюємо стан
    getCategories().then((data) => setCategories(data));
  }, []);

  return (
    <div className={css.menuContainer}>
      <button
        onClick={toggle}
        className={css.menuBtn}>
        Notes
      </button>
      {isOpen && (
        <ul className={css.menu}>
          <li className={css.menuItem}>
            <Link
              href={`/notes/filter/all`}
              onClick={toggle}>
              All notes
            </Link>
          </li>
          {categories.map((category) => (
            <li
              key={category.id}
              className={css.menuItem}>
              <Link
                href={`/notes/filter/${category.id}`}
                onClick={toggle}>
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoriesMenu;
