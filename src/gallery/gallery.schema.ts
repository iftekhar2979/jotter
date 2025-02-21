import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Gallery extends Document {
  @Prop({ required: true })
  userID: mongoose.Schema.Types.ObjectId | null;
  @Prop({ required: true })
  profileID: mongoose.Schema.Types.ObjectId | null;
  @Prop({ required: true, type: String })
  imageURL: string;
}

export const gallerySchema = SchemaFactory.createForClass(Gallery);
