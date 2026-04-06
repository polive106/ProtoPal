import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  Input,
  Label,
  FrostedPanel,
  ErrorAlert,
} from '@acme/design-system';
import { useNoteDrawerForm } from '../hooks';
import { handleFormSubmit, getFieldError } from '@/lib/formUtils';

interface NoteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: { id: string; title: string; content: string };
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
}

export function NoteDrawer(props: NoteDrawerProps) {
  const { form, serverError, setServerError, isLoading, isEdit, handleCancel } = useNoteDrawerForm(props);

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto" data-testid="notes-form">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Note' : 'New Note'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update the note details below.' : 'Fill in the details to create a new note.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleFormSubmit(() => form.handleSubmit())} noValidate className="space-y-5 mt-6">
          <FrostedPanel className="p-4 space-y-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
            <form.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    data-testid="notes-input-title"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive" data-testid="notes-error-title">{getFieldError(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field name="content">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <textarea
                    id="content"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    rows={6}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="notes-input-content"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive" data-testid="notes-error-content">{getFieldError(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </form.Field>
          </FrostedPanel>
          {serverError && <ErrorAlert message={serverError} onDismiss={() => setServerError(null)} data-testid="notes-alert-error" />}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel} data-testid="notes-btn-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="notes-btn-save">
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
