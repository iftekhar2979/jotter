import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Favourite extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  userId: mongoose.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Files', default: null })
  fileId: mongoose.ObjectId;
}

export const FavouriteSchema = SchemaFactory.createForClass(Favourite);
