// app/@modal/(.)notes/[id]/page.tsx

import { getSingleNote } from "@/lib/api";
import Modal from "@/components/Modal/Modal";

type Props = {
  params: Promise<{ id: string }>;
};

const NotePreview = async ({ params }: Props) => {
  const { id } = await params;
  const note = await getSingleNote(id);

  return (
    <Modal>
      <h2>{note.title}</h2>
      <p>{note.content}</p>
    </Modal>
  );
};

export default NotePreview;
