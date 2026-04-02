import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@acme/design-system';
import { NoteList, NoteDrawer, useCreateNote, useUpdateNote } from '@/features/notes';

export const Route = createFileRoute('/_authenticated/notes/')({
  component: NotesPage,
});

interface DrawerState {
  open: boolean;
  note?: { id: string; title: string; content: string };
}

function NotesPage() {
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const handleSubmit = async (data: { title: string; content: string }) => {
    if (drawer.note) {
      await updateNote.mutateAsync({ id: drawer.note.id, ...data });
    } else {
      await createNote.mutateAsync(data);
    }
  };

  return (
    <div data-testid="notes-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" data-testid="notes-page-title">Notes</h1>
        <Button onClick={() => setDrawer({ open: true })} data-testid="notes-btn-create">
          New Note
        </Button>
      </div>

      <NoteList
        onEdit={(note) => setDrawer({ open: true, note })}
        onCreate={() => setDrawer({ open: true })}
      />

      <NoteDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer((prev) => open ? prev : { open: false })}
        note={drawer.note}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
