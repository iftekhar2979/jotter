import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

// Enums based on your input
export enum Interest {
  Games = 'games',
  Movie = 'movie',
  Dancing = 'dancing',
  Car = 'car',
  Sports = 'sports',
  Music = 'music',
  Nature = 'nature',
  Driving = 'driving',
  Yoga = 'yoga',
  Writing = 'writing',
  Biking = 'biking',
  Cars = 'cars',
  Fishing = 'fishing',
  Cooking = 'cooking',
  Arts = 'arts',
  Reading = 'reading',
}
export enum SpokenLanguages {
  English = 'english',
  Spanish = 'spanish',
  French = 'french',
  German = 'german',
  Italian = 'italian',
  Chinese = 'chinese',
  Japanese = 'japanese',
  Russian = 'russian',
  Portuguese = 'portuguese',
  Arabic = 'arabic',
  Hindi = 'hindi',
  Bengali = 'bengali',
  Urdu = 'urdu',
  Turkish = 'turkish',
  Korean = 'korean',
  Dutch = 'dutch',
  Greek = 'greek',
  Hebrew = 'hebrew',
  Swahili = 'swahili',
  Tamil = 'tamil',
  Thai = 'thai',
}

export enum CoreValue {
  Honesty = 'honesty',
  Integrity = 'integrity',
  Kindness = 'kindness',
  Respect = 'respect',
  Loyalty = 'loyalty',
  Adventure = 'adventure',
  Faith = 'faith',
  Humor = 'humor',
  Empathy = 'empathy',
  Growth = 'growth',
  Responsibility = 'responsibility',
  Curiosity = 'curiosity',
  Gratitude = 'gratitude',
  Stability = 'stability',
  Positivity = 'positivity',
  Equality = 'equality',
  Sustainability = 'sustainability',
  WorkLifeBalance = 'work_life_balance',
  SelfCare = 'self_care',
  Creativity = 'creativity',
  Boundaries = 'boundaries',
  RespectForDiversity = 'respect_for_diversity',
  RespectForPrivacy = 'respect_for_privacy',
  Teamwork = 'teamwork',
  IntellectualGrowth = 'intellectual_growth',
  Freedom = 'freedom',
  Spirituality = 'spirituality',
  Ambition = 'ambition',
  SenseOfPurpose = 'sense_of_purpose',
  Minimalism = 'minimalism',
  Patience = 'patience',
  Environmentalism = 'environmentalism',
  Traditionalism = 'traditionalism',
  OpenMindedness = 'open_mindedness',
  FamilyOrientation = 'family_orientation',
  Generosity = 'generosity',
  Forgiveness = 'forgiveness',
  Independence = 'independence',
  Humility = 'humility',
  SelfAwareness = 'self_awareness',
  HealthWellness = 'health_wellness',
  CommunityService = 'community_service',
  FinancialResponsibility = 'financial_responsibility',
  Authenticity = 'authenticity',
  LoveOfFamily = 'love_of_family',
  Mindfulness = 'mindfulness',
  Trustworthiness = 'trustworthiness',
  PassionForTheArts = 'passion_for_the_arts',
}
export enum LifeStyleEnum {
  InfluencerStatus = 'influencer_status',
  SociallyActive = 'socially_active',
  OffTheGrid = 'off_the_grid',
  PassiveSculler = 'passive_sculler',
  ThoughtfulGestures = 'thoughtful_gestures',
  Presents = 'presents',
  Touch = 'touch',
  Compliments = 'compliments',
  TimeTogether = 'time_together',
  BigTimeTexter = 'big_time_texter',
  PhoneCaller = 'phone_caller',
  VideoChatter = 'video_chatter',
  Text = 'text',
  BetterInPerson = 'better_in_person',
  Bachelors = 'bachelors',
  College = 'college',
  HighSchool = 'high_school',
  PhD = 'phd',
  Masters = 'masters',
  Cat = 'cat',
  Dog = 'dog',
  Bird = 'bird',
  Fish = 'fish',
  Everyday = 'everyday',
  Often = 'often',
  Sometimes = 'sometimes',
  Never = 'never',
  NotForMe = 'not_for_me',
  Sober = 'sober',
  SoberCurious = 'sober_curious',
  MostNight = 'most_night',
  OnSpecialOccasions = 'on_special_occasions',
  SociallyOnWeekends = 'socially_on_weekends',
  SocialSmoker = 'social_smoker',
  SmokerWhenDrinking = 'smoker_when_drinking',
  NonSmoker = 'non_smoker',
  Smoker = 'smoker',
}

// Define the User schema using the Schema decorator
@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userID: mongoose.Schema.Types.ObjectId;
  @Prop({ required: false, trim: true, minlength: 2, maxlength: 30 })
  fullName: string;
  @Prop({ required: false, minlength: 2, maxlength: 25 })
  country: string;
  @Prop({ required: true })
  dOB: Date;
  @Prop()
  gender: string;
  @Prop({required:true})
  address: string;
  @Prop({ type: Object })
  location: {
    type: 'Point';
    coordinates: [number];
  };
}
// Create the schema and apply pre-save hook outside the class
export const ProfileSchema = SchemaFactory.createForClass(Profile);
ProfileSchema.index({
  interest: 'text',
  values: 'text',
  lifeStyle: 'text',
  gender: 'text',
});
