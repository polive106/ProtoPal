export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  userId: string;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
}
