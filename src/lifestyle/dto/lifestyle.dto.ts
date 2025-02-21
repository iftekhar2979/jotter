import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId, Types } from 'mongoose';
import {
  CommunicationStyle,
  DrinkingFrequency,
  EducationLevel,
  ExerciseEnum,
  PetType,
  RelationshipPreference,
  SmokingStatus,
  SocialMediaActivity,
} from '../lifestyle.schema';

export class LifeStyleOnServiceDto {
  @IsNotEmpty()
  @IsString()
  userID: string;
  @IsNotEmpty()
  @IsEnum(SmokingStatus, { message: 'Smoking must be Valid !' })
  smoking: string;

  @IsNotEmpty()
  @IsEnum(DrinkingFrequency, { message: 'Drinking on life style must be valid!' })
  drinking: string;

  @IsNotEmpty()
  @IsEnum(PetType, { message: 'Pet on Life style must be valid!' })
  pets: string;

  @IsNotEmpty()
  @IsEnum(ExerciseEnum, { message: 'Exercise on Life style must be valid!' })
  execise: string;

  @IsNotEmpty()
  @IsEnum(EducationLevel, { message: 'Education on Life style must be valid!' })
  education: string;

  @IsNotEmpty()
  @IsEnum(CommunicationStyle, {
    message: 'Communication style on Life style must be valid!',
  })
  communicationStyle: string;

  @IsNotEmpty()
  @IsEnum(RelationshipPreference, {
    message: 'Relationship Preference on life style must be valid!',
  })
  relationshipPreference: string;

  @IsNotEmpty()
  @IsEnum(SocialMediaActivity, {
    message: 'Social Media on life style must be valid!',
  })
  socialMedia: string;
}
