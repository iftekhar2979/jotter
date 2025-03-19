import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs'; // Import bcryptjs
import * as argon2 from 'argon2';

// Define the User schema using the Schema decorator
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Profile', default: null })
  profileID: mongoose.Schema.Types.ObjectId | null;

  @Prop({ default: false })
  isEmailVerified: boolean;
  @Prop({ required: false, default: null })
  profilePicture: string | null;
  @Prop({ default: false })
  isDeleted: boolean;
  @Prop({ type: String, default: null })
  pin: string;
  @Prop({ type: Number, default: 0 })
  pinAttempts: number;
  updatedAt: Date; 
}

// Create the schema and apply pre-save hook outside the class
export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash the password before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      // Hash the password using Argon2
      this.password = await argon2.hash(this.password);
      console.timeEnd('Password Hashed');
    } catch (error) {
      console.error('Error hashing password:', error);
      next(error); // If hashing fails, propagate the error
    }
  }
  next();
});
UserSchema.index({ name: 'text', phone: 'text' });
@Schema({ timestamps: true })
export class Storage extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  userId: mongoose.ObjectId;
  @Prop({ type: Number, default: 15360 })
  total: number;
  @Prop({ type: Number, default: 0 })
  used: number;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
