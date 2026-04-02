import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PageSpinner, ErrorAlert } from '@acme/design-system';
import { NoteDrawer, useNote, useUpdateNote } from '@/features/notes';

export const Route = createFileRoute('/_authenticated/notes/$noteId')({
  component: NoteDetailPage,
});

function NoteDetailPage() {
  const { noteId } = Route.useParams();
  const navigate = useNavigate();
  const { data: note, isLoading, error } = useNote(noteId);
  const updateNote = useUpdateNote();

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!note) return <ErrorAlert message="Note not found" />;

  return (
    <NoteDrawer
      open
      onOpenChange={(open) => {
        if (!open) navigate({ to: '/notes' });
      }}
      note={{ id: note.id, title: note.title, content: note.content }}
      onSubmit={async (data) => {
        await updateNote.mutateAsync({ id: noteId, ...data });
        navigate({ to: '/notes' });
      }}
    />
  );
}
