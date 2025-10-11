// app/@modal/(.)notes/[id]/page.tsx

import Modal from "@/components/Modal/Modal";
import { getSingleNote } from "@/lib/api/clientApi";

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
