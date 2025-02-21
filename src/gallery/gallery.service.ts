// src/gallery/gallery.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { Gallery } from './gallery.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/interface/jwt.info.interfact';
import { FileType } from './interface/gallery.interface';
import { Response } from 'src/common/interface/response.interface';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel('Gallery') private readonly galleryModel: Model<Gallery>,
  ) {}

  // Save image file path (or any additional gallery info)
  async addImage(user: User, file: FileType[]): Promise<any> {
    if (file.length < 4) {
      throw new BadRequestException(`Minimum 4 Image required!`);
    }
    let count: number = await this.galleryModel.countDocuments({
      userID: user.id,
    });
    // console.log(count<=6);
    if (count > 7) {
      throw new BadRequestException(
        `You already have ${count} images in your gallery . You can't add more than 6 pictures in gallery!`,
      );
    }
    const images = file.map((singleFile: FileType) => {
      return {
        userID: user.id,
        profileID: user.profileID,
        imageURL: `${singleFile.destination.slice(7, singleFile.destination.length)}/${singleFile.filename}`,
      };
    });
    // if(images)
    // console.log(images);
    let imageLengths = images.length;
    let totalImageWithOld = imageLengths + count;
    if (totalImageWithOld > 7) {
      throw new BadRequestException(
        "You can't add more than 6 pictures in gallery!",
      );
    }
    await this.galleryModel.insertMany(images);
    return { message: 'Image uploaded successfully !', data: {} };
  }

  async removeImage(user: User, imageID: string): Promise<any> {
    let count = await this.galleryModel.countDocuments({ userID: user.id });
    if (count <= 4) {
      throw new BadRequestException('Minimum 4 image required!');
    }
    await this.galleryModel.findByIdAndDelete(imageID);
    return { message: 'Image removed successfully', data: {} };
  }

  async addSingleImage(user: User, file: FileType): Promise<any> {
    let count = await this.galleryModel.countDocuments({ userID: user.id });
    // console.log(count);
    if (count >= 6) {
      throw new BadRequestException(
        'More than 6 image not allowed to upload !',
      );
    }
    let newImage = new this.galleryModel({
      userID: user.id,
      profileID: user.profileID,
      imageURL: `${file.destination.slice(7, file.destination.length)}/${file.filename}`,
    });
    await newImage.save();
    return { message: 'Image uploaded successfully', data: {} };
  }
  async getFullGallery(user: User): Promise<any> {
    console.log(user)
    return {
      message: 'Image uploaded successfully',
      data:await this.galleryModel.find({ userID: user.id },{imageURL:-1,createdAt:-1}),
    };
  }
}
