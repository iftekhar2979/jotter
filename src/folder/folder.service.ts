import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Folder } from './folder.schema';

@Injectable()
export class FolderService {
  constructor(@InjectModel(Folder.name) private folderModel: Model<Folder>) {}

  // Create a new folder
  async createFolder(
    name: string,
    ownerId: any,
    parentFolderId: string | null = null,
  ): Promise<Folder> {
    const folderList = await this.getFoldersByOwner({
      ownerId,
      parentFolderId,
      name,
    });
    if (folderList) {
      throw new BadRequestException('Folder Already Exist');
    }

    const folder = new this.folderModel({
      name,
      ownerId,
      parentFolderId,
    });

    return folder.save();
  }

  // Get folders by owner
  getFoldersByOwner(query: {
    ownerId?: ObjectId;
    parentFolderId?: string | null;
    name?: string;
  }): Promise<Folder> {
    return this.folderModel.findOne(query);
  }
  getFolderByIdAndUserId(query: {
    ownerId?: ObjectId;
    folderId?: ObjectId;
  }): Promise<Folder> {
    return this.folderModel.findOne(query);
  }
  getAllFolders(query: {
    ownerId?: ObjectId;
    parentFolderId?: string | null;
    name?: string;
  }): Promise<Folder[]> {
    return this.folderModel.find(query);
  }
  getFilesAndFolder({
    ownerId,
    parentFolderId =null,
    name
  }:{
    ownerId?: ObjectId;
    parentFolderId?: ObjectId | null;
    name?: string;
  }): Promise<Folder[]> {
   return  this.folderModel.aggregate([{
    $match:{
      parentFolderId,
      ownerId
    }
   }])
  }

  async getFolders(ownerId: ObjectId) {
    let folders = await this.getAllFolders({ ownerId });
    return { message: 'Folders Retrived Successfully!', data: folders };
  }
  // Get folder by id
  async getFolderById(id: string): Promise<Folder> {
    return this.folderModel.findById(id);
  }

  // Update a folder
  async updateFolder(id: string, name: string): Promise<Folder> {
    return this.folderModel.findByIdAndUpdate(
      id,
      { name, updatedAt: Date.now() },
      { new: true },
    );
  }

  // Delete a folder
  async deleteFolder(id: string): Promise<Folder> {
    return this.folderModel.findByIdAndDelete(id);
  }
}
