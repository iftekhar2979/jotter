import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LifeStyle } from './lifestyle.schema';
import { LifeStyleOnServiceDto } from './dto/lifestyle.dto';
import { Response } from 'src/common/interface/response.interface';
import { LifeStyleDto } from 'src/profile/dto/lifeStyleAndValues.dto';

@Injectable()
export class LifestyleService {
  constructor(
    @InjectModel(LifeStyle.name)
    private readonly lifeStyleModel: Model<LifeStyle>,
  ) {}
  async getLifeStyleByUserID(userID: string): Promise<LifeStyle> {
    const lifestyle = await this.lifeStyleModel.findOne({ userID }).exec();
    if (!lifestyle) {
      throw new NotFoundException(`Users life style not found!`);
    }
    return lifestyle;
  }
  // CREATE: Create a new lifestyle entry
  async createLifeStyle(lifeStyleDto: LifeStyleOnServiceDto): Promise<any> {
   let userLifestyle= await this.getLifeStyleByUserID(lifeStyleDto.userID)
   if(!userLifestyle){
      await this.lifeStyleModel.create(lifeStyleDto);
   }
   await this.lifeStyleModel.findOneAndUpdate({userID:lifeStyleDto.userID},{lifeStyleDto});
  
    return {message:"User Updated successfully!"}
  }

  // READ: Get lifestyle by userID


  // UPDATE: Update lifestyle by ID
  async updateLifeStyle(
    id: string,
    lifeStyleDto: LifeStyleDto,
  ): Promise<Response<any>> {
    let lifestyle = await this.lifeStyleModel.findOne({ userID: id }).exec();
    if (!lifestyle) {
      throw new ConflictException('Users Life Style not found!');
    }
    // console.log(lifestyle)
   await this.lifeStyleModel
      .findOneAndUpdate({userID:id}, lifeStyleDto, { new: true })
      .exec();
    return {
      message: 'Life style updated successfully!',
      data: {},
      statusCode: 200,
    };
  }

  // DELETE: Delete lifestyle by ID
  async deleteLifeStyle(id: string): Promise<LifeStyle> {
    const deletedLifeStyle = await this.lifeStyleModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedLifeStyle) {
      throw new NotFoundException(`Lifestyle with ID ${id} not found`);
    }
    return deletedLifeStyle;
  }
}
