import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the Folder Schema
@Schema()
export class Folder extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  parentFolderId: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

// Create the Mongoose schema from the Folder class
export const FolderSchema = SchemaFactory.createForClass(Folder);
