// app/notes/action/create

import NoteForm from "@/components/NoteForm/NoteForm";
import { getCategories } from "@/lib/api/clientApi";

const CreateNote = async () => {
  const categories = await getCategories();

  return (
    <>
      <NoteForm categories={categories} />
    </>
  );
};

export default CreateNote;
