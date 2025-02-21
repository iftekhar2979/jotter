// src/user/user.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';
import { IUser } from './users.interface';
import { pagination } from 'src/common/pagination/pagination';
import { Pagination } from 'src/common/pagination/pagination.interface';
import { parse } from 'path';
import { CreateUserDto } from './dto/createUser.dto';
import { FileType } from 'src/gallery/interface/gallery.interface';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  // Create a new user

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }
  async updateProfilePicture(id: string, url: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      { profilePicture: url },
      { new: true },
    );
  }
  async checkUserExistWiththeName(createUserDto: CreateUserDto): Promise<User> {
    return await this.userModel.findOne({ name: createUserDto.name });
  }
  async checkUserExistWiththeEmail(
    createUserDto: CreateUserDto,
  ): Promise<User> {
    return await this.userModel.findOne({ email: createUserDto.email });
  }
  // Get all users

  async findAll(query): Promise<{ data: User[]; pagination: Pagination }> {
    let page = parseFloat(query.page);
    let limit = parseFloat(query.limit);
    const skip = (page - 1) * limit;
    const data = await this.userModel
      .find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.userModel.countDocuments().exec();
    return { data, pagination: pagination(limit, page, total) };
  }
  // Find a user by ID
  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).select('-password').exec();
  }

  // Update a user by ID
  async update(id: string, updateUserDto: IUser): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  // Delete a user by ID
  async delete(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
  async uploadProfilePicture(user: User, file: FileType): Promise<any> {
    await this.updateProfilePicture(
      user.id,
      `${file.destination}/${file.filename}`,
    );
    return { message: 'Profile Picture Uploaded Successfully', data: {} };
  }
}
