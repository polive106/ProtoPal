import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@acme/design-system';
import { useTranslation } from '@acme/i18n';

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  onEdit: (note: { id: string; title: string; content: string }) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ id, title, content, updatedAt, onEdit, onDelete }: NoteCardProps) {
  const { t } = useTranslation('notes');

  return (
    <Card data-testid={`notes-card-${id}`}>
      <CardHeader>
        <CardTitle className="text-lg font-heading" data-testid={`notes-title-${id}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`notes-content-${id}`}>{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(updatedAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit({ id, title, content })} data-testid={`notes-btn-edit-${id}`}>
            {t('card.edit')}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(id)} data-testid={`notes-btn-delete-${id}`}>
            {t('card.delete')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
