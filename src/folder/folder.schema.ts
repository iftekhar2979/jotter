import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

// Define the Folder Schema
@Schema()
export class Folder extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  parentFolderId: string;

  @Prop({ default: '/' })
  path: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  ownerId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

// Create the Mongoose schema from the Folder class
export const FolderSchema = SchemaFactory.createForClass(Folder);
