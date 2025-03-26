import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Favourite } from './favourite.schema';
import mongoose, { Model, ObjectId } from 'mongoose';
import { FileService } from 'src/files/files.service';
import { pagination } from 'src/common/pagination/pagination';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectModel(Favourite.name)
    private readonly favouriteModel: Model<Favourite>,
    private readonly fileService: FileService,
  ) {}

  async makeFavourite({
    userId,
    fileId,
  }: {
    userId: ObjectId;
    fileId: ObjectId;
  }) {
    const file = await this.fileService.getFile(fileId);
    if (!file) {
      throw new HttpException('File not found!', 404);
    }
    const alreadyFavourite = await this.favouriteModel.findOne({
      fileId: file._id,
      userId: userId,
    });
    
    if (!alreadyFavourite) {
      await this.favouriteModel.create({ userId, fileId: file._id });
      return { message: 'file Added to favourite', data: file };
    } else {
      console.log('Values');
      const deletedFile = await this.favouriteModel.deleteOne({
        userId,
        fileId: file._id,
      });
      return { message: 'file removed from favourite', data: deletedFile };
    }
  }
  async getFavouriteFiles({
    userId,
    search = '',
    page = 1,
    limit = 10,
  }: {
    userId: mongoose.Types.ObjectId;
    search: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;
    const pipeline = [
      // Match favourites by userId
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      // Join the Favourite collection with the Files collection
      {
        $lookup: {
          from: 'files', // The collection we are joining
          localField: 'fileId',
          foreignField: '_id',
          as: 'file',
        },
      },
      // Flatten the file array (since $lookup results in an array)
      {
        $unwind: {
          path: '$file',
          preserveNullAndEmptyArrays: true, // Keep favourites even if there's no corresponding file
        },
      },
      // Match based on search query in fileName (case-insensitive search)
      {
        $match: {
          'file.fileName': { $regex: search, $options: 'i' },
        },
      },
      // Pagination - skip and limit
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      // Project the file information
      {
        $project: {
          _id: 1,
          fileId: 1,
          fileName: '$file.fileName',
          size: '$file.size',
          url: '$file.url',
          mimetype: '$file.mimetype',
          createdAt: '$file.createdAt',
          updatedAt: '$file.updatedAt',
        },
      },
    ];

    const [files, count] = await Promise.all([
      await this.favouriteModel.aggregate(pipeline),
      await this.favouriteModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'files',
            localField: 'fileId',
            foreignField: '_id',
            as: 'file',
          },
        },
        {
          $unwind: {
            path: '$file',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'file.fileName': { $regex: search, $options: 'i' },
          },
        },
        {
          $count: 'totalCount',
        },
      ]),
    ]);
    if (count.length === 0) {
      throw new HttpException('Empty favourite list', 404);
    }
    return {
      message: 'favourite retrives successfully',
      data: files,
      pagination: pagination(limit, page, count[0].totalCount),
    };
  }
}
