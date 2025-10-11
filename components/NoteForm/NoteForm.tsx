// components/NoteForm/NoteForm.tsx

"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useNoteDraftStore } from "@/lib/stores/noteStore";
import { Category, createNote, NewNoteData } from "@/lib/api/clientApi";

type Props = {
  categories: Category[];
};

const NoteForm = ({ categories }: Props) => {
  const router = useRouter();

  const { draft, setDraft, clearDraft } = useNoteDraftStore();

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    // 4. Коли користувач змінює будь-яке поле форми — оновлюємо стан
    setDraft({
      ...draft,
      [event.target.name]: event.target.value,
    });
  };

  const handleCancel = () => router.push("/notes/filter/all");

  const { mutate } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      clearDraft();
      router.push("/notes/filter/all");
    },
  });

  const handleSubmit = (formData: FormData) => {
    const values = Object.fromEntries(formData) as NewNoteData;
    mutate(values);
  };

  return (
    <form action={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          name="title"
          defaultValue={draft?.title}
          onChange={handleChange}
        />
      </label>

      <label>
        Content
        <textarea
          name="content"
          defaultValue={draft?.content}
          onChange={handleChange}></textarea>
      </label>

      <label>
        Category
        <select
          name="category"
          defaultValue={draft?.categoryId}
          onChange={handleChange}>
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <button type="submit">Create</button>
        <button
          type="button"
          onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default NoteForm;
