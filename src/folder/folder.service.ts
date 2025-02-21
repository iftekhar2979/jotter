import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder } from './folder.schema';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
  ) {}

  // Create a new folder
  async createFolder(name: string, ownerId: string, parentFolderId: string = null): Promise<Folder> {
    const folder = new this.folderModel({
      name,
      ownerId,
      parentFolderId,
    });

    return folder.save();
  }

  // Get folders by owner
  async getFoldersByOwner(ownerId: string): Promise<Folder[]> {
    return this.folderModel.find({ ownerId });
  }

  // Get folder by id
  async getFolderById(id: string): Promise<Folder> {
    return this.folderModel.findById(id);
  }

  // Update a folder
  async updateFolder(id: string, name: string): Promise<Folder> {
    return this.folderModel.findByIdAndUpdate(id, { name, updatedAt: Date.now() }, { new: true });
  }

  // Delete a folder
  async deleteFolder(id: string): Promise<Folder> {
    return this.folderModel.findByIdAndDelete(id);
  }
}
