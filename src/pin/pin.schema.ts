import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs'; // Import bcryptjs
import * as argon2 from 'argon2';

// Define the User schema using the Schema decorator
@Schema({ timestamps: true })
export class Lock extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: mongoose.Schema.Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'File', index: true })
  fileId: mongoose.ObjectId;
}
