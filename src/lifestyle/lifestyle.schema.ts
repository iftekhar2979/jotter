import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

// Enums based on your input

export enum SmokingStatus {
  SocialSmoker = 'social_smoker',
  SmokerWhenDrinking = 'smoker_when_drinking',
  NonSmoker = 'non_smoker',
  Smoker = 'smoker',
}
export enum DrinkingFrequency {
  NotForMe = 'not_for_me',
  Sober = 'sober',
  SoberCurious = 'sober_curious',
  MostNight = 'most_night',
  OnSpecialOccasions = 'on_special_occasions',
  SociallyOnWeekends = 'socially_on_weekends',
}
export enum ExerciseEnum {
  Everyday = 'everyday',
  Often = 'often',
  Sometimes = 'sometimes',
  Never = 'never',
}

export enum PetType {
  Cat = 'cat',
  Dog = 'dog',
  Bird = 'bird',
  Fish = 'fish',
}

export enum EducationLevel {
  Bachelors = 'bachelors',
  College = 'college',
  HighSchool = 'high_school',
  PhD = 'phd',
  Masters = 'masters',
}

export enum CommunicationStyle {
  BigTimeTexter = 'big_time_texter',
  PhoneCaller = 'phone_caller',
  VideoChatter = 'video_chatter',
  Text = 'text',
  BetterInPerson = 'better_in_person',
}

export enum RelationshipPreference {
  ThoughtfulGestures = 'thoughtful_gestures',
  Presents = 'presents',
  Touch = 'touch',
  Compliments = 'compliments',
  TimeTogether = 'time_together',
}

export enum SocialMediaActivity {
  InfluencerStatus = 'influencer_status',
  SociallyActive = 'socially_active',
  OffTheGrid = 'off_the_grid',
  PassiveSculler = 'passive_sculler',
}

@Schema({ timestamps: true })
export class LifeStyle extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userID: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(SmokingStatus),
    required: true,
    trim: true,
    lowercase: true,
  })
  smoking: SmokingStatus;

  @Prop({
    type: String,
    enum: Object.values(DrinkingFrequency),
    required: true,
    trim: true,
  })
  drinking: DrinkingFrequency;


  @Prop({
    type: String,
    enum: Object.values(PetType),
    required: true,
    trim: true,
  })
  pets: PetType;

  @Prop({
    type: String,
    enum: Object.values(ExerciseEnum),
    required: true,
    trim: true,
  })
  execise: ExerciseEnum;

  @Prop({
    type: String,
    enum: Object.values(EducationLevel),
    required: true,
    trim: true,
  })
  education: EducationLevel;

  @Prop({
    type: String,
    enum: Object.values(CommunicationStyle),
    required: true,
    trim: true,
  })
  communicationStyle: CommunicationStyle;

  @Prop({
    type: String,
    enum: Object.values(RelationshipPreference),
    required: true,
    trim: true,
  })
  relationshipPreference: RelationshipPreference;

  @Prop({
    type: String,
    enum: Object.values(SocialMediaActivity),
    required: true,
    trim: true,
  })
  socialMedia: SocialMediaActivity;
}

// Create the schema and apply pre-save hook outside the class
export const LifeStyleSchema = SchemaFactory.createForClass(LifeStyle);
