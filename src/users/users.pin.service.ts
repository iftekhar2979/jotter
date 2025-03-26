import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordWithArgon } from 'src/common/bycrypt/bycrypt';
import e from 'express';

@Injectable()
export class PinService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async createPin({ pin, userInfo }: { pin: string; userInfo }) {
    const user = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userInfo.id),
    });
    if (userInfo.pin === 'forgot') {
      user.pin = pin;
      await user.save();
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
        name: user.name,
        tokenFor: 'auth',
        pin: 'checked',
      };
      console.log(payload);
      const token = this.jwtService.sign(payload);
      return { message: 'Pin changed successfully', data: {}, token };
    }
    if (user.pin) {
      throw new BadRequestException('Pin already exist !');
    }
    user.pin = pin;
    await user.save();
    const payload = {
      email: user.email,
      id: userInfo.id,
      role: user.role,
      name: user.name,
      tokenFor: 'auth',
      pin: 'unchecked',
    };
    const token = this.jwtService.sign(payload);
    return { message: 'Pin set successfully', data: {}, token };
  }
  async checkPin({ pin, userId }: { pin: string; userId: string }) {
    const user = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (user) {
      if (user.pinAttempts > 3) {
        if (user && user.updatedAt) {
          const timeDifference = Date.now() - user.updatedAt.getTime();
          if (timeDifference < 60000) {
            throw new BadRequestException(
              `You can retry the pin only after ${Math.round(60 - timeDifference / 1000)} seconds`,
            );
          }
        }
      }
    }
    if (!user.pin) {
      throw new HttpException('Pin Not Found', 404);
    }
    if (user.pin !== pin) {
      user.pinAttempts += 1;
      await user.save();
      throw new ForbiddenException('Pin not matched!');
    }
    user.pinAttempts = 0;
    const payload = {
      email: user.email,
      id: user._id,
      role: user.role,
      name: user.name,
      tokenFor: 'auth',
      pin: 'checked',
    };
    const token = this.jwtService.sign(payload);
    return { message: 'Pin matched', data: {}, token };
  }
  async forgotPin({ password, user }: { password: string; user }) {
    let userInfo = await this.userModel.findById({ _id: user.id }, 'password');
    if (!user) {
      throw new BadRequestException('User not Found!');
    }
    let isMatch = await comparePasswordWithArgon(password, userInfo.password);
    if (!isMatch) {
      throw new BadRequestException('Password not matched !');
    }
    const payload = {
      email: user.email,
      id: userInfo._id,
      role: user.role,
      name: user.name,
      tokenFor: 'auth',
      pin: 'forgot',
    };
    const token = this.jwtService.sign(payload);
    return { message: 'Password Matched', data: {}, token };
  }
  async updateMe(
    user,
    info: { name?: string; email?: string },
  ): Promise<any> {
    await Promise.all([
      this.userModel.findOneAndUpdate(
        { userID: user.id },
        { name: info.name, email: info.email },
        { new: true },
      ),
    ]);
    return {
      message: 'Information Upated Successfully',
      data: {},
      statusCode: 200,
    };
  }
}
