import { FileService } from './../files.service';
import { BadRequestException, HttpException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Files } from '../files.schema';
import mongoose, { Model, ObjectId } from 'mongoose';
import { pagination } from 'src/common/pagination/pagination';
import { Favourite } from 'src/favourite/favourite.schema';
import { Folder } from 'src/folder/folder.schema';
import { s3 } from 'src/common/multer/multer.config';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
export class FileStorage {
  constructor(
    @InjectModel(Files.name) private readonly fileModel: Model<Files>,
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    private readonly fileService: FileService,
  ) {}

  async renameFile({
    userId,
    fileId,
    fileName,
  }: {
    userId: string;
    fileId: ObjectId;
    fileName: string;
  }) {
    const file = await this.fileModel.findOne(fileId);
    if (!file) {
      throw new BadRequestException('File not found!');
    }
    if (file.userId.toString() !== userId) {
      throw new BadRequestException('File not accessible!');
    }
    file.fileName = fileName;
    await file.save();
    // console.log("Renamed Successfully ",file)
    return { message: 'Renamed Successfully', data: file };
  }
  async filterFile({
    userId,
    type='image',
    name,
    limit = 10,
    page = 1,
  }: {
    userId: ObjectId;
    type: 'image' | 'pdf' | 'text';
    name: string;
    limit: number;
    page: number;
  }) {
    let query: any = {
      userId,
      mimetype :{ $regex: type, $options: 'i' }
    };
    // if (type) {
    //   query.mimetype = { $regex: type, $options: 'i' };
    // }
    if (name) {
      query.$or = [
        { fileName: { $regex: name, $options: 'i' } },
        { recognizedText: { $regex: name, $options: 'i' } }
      ];
    }
  
    const file = await this.fileModel
      .aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'favourites',
            localField: '_id',
            foreignField: 'fileId',
            as: 'favourite',
            pipeline: [
              {
                $project: {
                  id: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'locks',
            localField: '_id',
            foreignField: 'fileId',
            as: 'locked',
            pipeline: [
              {
                $project: {
                  id: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            isFavourite: {
              $cond: {
                if: { $gt: [{ $size: '$favourite' }, 0] },
                then: true,
                else: false,
              },
            },
            isLocked: {
              $cond: {
                if: { $gt: [{ $size: '$locked' }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $match: {
            isLocked: false,
          },
        },
        {
          $project: {
            favourite: 0,
            locked: 0,
          },
        },
      ])
      .skip(limit * (page - 1))
      .limit(limit);


      const countQuery=[
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'favourites',
            localField: '_id',
            foreignField: 'fileId',
            as: 'favourite',
            pipeline: [
              {
                $project: {
                  id: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'locks',
            localField: '_id',
            foreignField: 'fileId',
            as: 'locked',
            pipeline: [
              {
                $project: {
                  id: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            isFavourite: {
              $cond: {
                if: { $gt: [{ $size: '$favourite' }, 0] },
                then: true,
                else: false,
              },
            },
            isLocked: {
              $cond: {
                if: { $gt: [{ $size: '$locked' }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $match: {
            isLocked: false,
          },
        },
        {
          $count: 'totalCount',
        },
      ]
    const count = await this.fileModel.aggregate(countQuery);
    console.log(file)
    if(count.length===0){
      throw new HttpException('No file found', 404);
    }
    if (!file) {
      throw new HttpException(`No ${type} found`, 404);
    }
    return {
      message: 'File retrived successfully!',
      data: file,
      pagination: pagination(limit, page, count[0]?.totalCount || 0),
    };
  }
  async deleteFile({ userId, fileId }: { userId: string; fileId: ObjectId }) {
    const file = await this.fileModel.findOne(fileId);
    if (!file) {
      throw new HttpException('File not found!', 404);
    }
    if (file.userId.toString() !== userId) {
      throw new BadRequestException('File is not accessible!');
    }
     await s3
    .deleteObject({ Bucket: configService.get<string>('AWS_S3_BUCKET_NAME'), Key: file.url.split("/")[1] })
    .promise();
    await this.fileService.updateStorage({
      userId: new mongoose.Types.ObjectId(userId) as unknown as ObjectId,
      size: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      option: 'decrement',
    });

    return {
      message: 'File removed',
      data: await this.fileModel.deleteOne(fileId),
    };
  }
  async storageAnalytics({
    userId,
    limit = 10,
    page = 1,
  }: {
    userId: string;
    limit: number;
    page: number;
  }) {
    let analyticsPipeline: any = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
     
      {
        $lookup: {
          from: 'locks',
          localField: '_id',
          foreignField: 'fileId',
          as: 'locked',
          pipeline: [
            {
              $project: {
                id: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          // isFavourite: {
          //   $cond: {
          //     if: { $gt: [{ $size: '$favourite' }, 0] },
          //     then: true,
          //     else: false,
          //   },
          // },
          isLocked: {
            $cond: {
              if: { $gt: [{ $size: '$locked' }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          isLocked: false,
        },
      },
      {
        $project: {
          // Create a new field `category` to classify each file type
          category: {
            $switch: {
              branches: [
                {
                  case: {
                    $regexMatch: { input: '$mimetype', regex: /^image\// },
                  },
                  then: 'image', // All image mimetypes will be grouped under "image"
                },
                {
                  case: { $eq: ['$mimetype', 'application/pdf'] },
                  then: 'pdf', // PDF files will be grouped under "pdf"
                },
                {
                  case: { $eq: ['$mimetype', 'text/plain'] },
                  then: 'text', // Text files will be grouped under "text"
                },
              ],
              default: 'other', // Files that don't match the above will be grouped under "other"
            },
          },
          size: { $ifNull: ['$size', 0] },
        },
      },
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          size: { $sum: '$size' },
        },
      },
      {
        $addFields: {
          // Ensure that we have exactly the three categories, with zero counts if not present
          categories: ['image', 'pdf', 'text'],
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalItems: 1,
          size: 1,
        },
      },
      {
        $group: {
          _id: null,
          categories: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          categories: {
            $map: {
              input: '$categories',
              as: 'category',
              in: {
                $cond: {
                  if: {
                    $in: ['$$category.category', ['image', 'pdf', 'text']],
                  },
                  then: '$$category',
                  else: {
                    category: 'other',
                    totalItems: 0,
                    size: 0,
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          result: {
            $arrayToObject: {
              $map: {
                input: '$categories',
                as: 'category',
                in: [
                  '$$category.category', // key
                  {
                    totalItems: '$$category.totalItems',
                    size: '$$category.size',
                  },
                ],
              },
            },
          },
        },
      },
    ];

    const information =await this.fileModel.aggregate(analyticsPipeline);
    const [analytics, totalItems, storageInformation, folderCount] =
      await Promise.all([
        information,
        this.fileModel.countDocuments({
          userId: new mongoose.Types.ObjectId(userId),
        }),
        this.fileService.getStorageInfo({ userId }),
        this.folderModel.countDocuments({ownerId: new mongoose.Types.ObjectId(userId)}),
      ]);

    return {
      message: 'Analytics Retrived Successfully',
      data: {
        analytics: analytics[0].result,
        storageInformation,
        folderCount,
      },
      pagination: pagination(limit, page, totalItems),
    };
  }
  async getRecentFiles({
    userId,
    limit = 10,
    page = 1,
  }: {
    userId: string;
    limit: number;
    page: number;
  }) {
    const recentUploads = this.fileModel
      .aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'favourites',
            localField: '_id',
            foreignField: 'fileId',
            as: 'favourite',
            pipeline: [
              {
                $project: {
                  id: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'locks',
            localField: '_id',
            foreignField: 'fileId',
            as: 'locked',
            pipeline: [
              {
                $project: {
                  id: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            isFavourite: {
              $cond: {
                if: { $gt: [{ $size: '$favourite' }, 0] },
                then: true,
                else: false,
              },
            },
            isLocked: {
              $cond: {
                if: { $gt: [{ $size: '$locked' }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $match: {
            isLocked: false,
          },
        },
        {
          $project: {
            favourite: 0,
            locked: 0,
          },
        },
      ])
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const [recent, totalItems] = await Promise.all([
      recentUploads,
      this.fileModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
      }),
    ]);
    return {
      message: 'Recents Retrived Successfully',
      data: recent,
      pagination: pagination(limit, page, totalItems),
    };
  }
  async getFileFilterByMonth({
    userId,
    date,
    limit = 10,
    page = 1,
  }: {
    date: string;
    userId: string;
    limit: number;
    page: number;
  }) {
    const startDate = new Date(date).getTime();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const filesByMonth = this.fileModel
      .find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const [files, totalItems] = await Promise.all([
      filesByMonth,
      this.fileModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lt: endDate },
      }),
    ]);

    return {
      message: 'Files filtered by month retrieved successfully',
      data: files,
      pagination: pagination(limit, page, totalItems),
    };
  }
}
