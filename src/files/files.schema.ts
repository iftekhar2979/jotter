import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'aws-sdk/clients/acm';
import mongoose, { mongo, ObjectId } from 'mongoose';

@Schema({ timestamps: true })
export class Files extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  userId: mongoose.ObjectId;
  @Prop({ required: true, trim: true })
  fileName: string;
  @Prop({ required: true, type: Number })
  size: number;
  @Prop({ required: true, type: String })
  url: string;
  @Prop({ required: true, type: String })
  mimetype: string;
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Folder' })
  folder: ObjectId;
}
export const FileSchema = SchemaFactory.createForClass(Files);
@Schema({ timestamps: true })
export class FileMeta extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Files', unique: true })
  fileId: mongoose.ObjectId;
  @Prop({ required: true })
  tags: string[];
  @Prop({ required: true, type: String })
  description: string;
}
export const FileMetaSchema = SchemaFactory.createForClass(Files);
