import { Note } from "@/lib/api";
import NoteItem from "../NoteItem/NoteItem";

type Props = {
  notes: Note[];
};

export default function NoteList({ notes }: Props) {
  return (
    <ul>
      {notes.map((note) => (
        <NoteItem key={note.id} item={note} />
      ))}
    </ul>
  );
}
