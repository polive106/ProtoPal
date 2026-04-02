import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateNote,
  CreateNoteError,
  ListNotes,
  UpdateNote,
  UpdateNoteError,
  DeleteNote,
  DeleteNoteError,
  GetNote,
  GetNoteError,
} from '@acme/domain';
import { CurrentUser } from '../common/decorators';
import { ZodValidationPipe } from '../common/decorators';
import type { JwtPayload } from '../services';
import { createNoteSchema, updateNoteSchema, type CreateNoteDto, type UpdateNoteDto } from './dto/notes.dto';

@Controller('notes')
export class NotesController {
  constructor(
    @Inject(CreateNote) private readonly createNote: CreateNote,
    @Inject(ListNotes) private readonly listNotes: ListNotes,
    @Inject(UpdateNote) private readonly updateNote: UpdateNote,
    @Inject(DeleteNote) private readonly deleteNote: DeleteNote,
    @Inject(GetNote) private readonly getNote: GetNote,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    const notes = await this.listNotes.execute(user.sub);
    return { notes };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createNoteSchema)) dto: CreateNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const note = await this.createNote.execute({
        title: dto.title,
        content: dto.content,
        userId: user.sub,
      });
      return { note };
    } catch (error) {
      if (error instanceof CreateNoteError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    try {
      const note = await this.getNote.execute(id, user.sub);
      return { note };
    } catch (error) {
      if (error instanceof GetNoteError) {
        if (error.message.includes('not found')) throw new NotFoundException(error.message);
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateNoteSchema)) dto: UpdateNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const note = await this.updateNote.execute({
        noteId: id,
        userId: user.sub,
        title: dto.title,
        content: dto.content,
      });
      return { note };
    } catch (error) {
      if (error instanceof UpdateNoteError) {
        if (error.message.includes('not found')) throw new NotFoundException(error.message);
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    try {
      await this.deleteNote.execute(id, user.sub);
    } catch (error) {
      if (error instanceof DeleteNoteError) {
        if (error.message.includes('not found')) throw new NotFoundException(error.message);
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }
}
