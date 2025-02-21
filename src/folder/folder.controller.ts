import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { FolderService } from './folder.service';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}
  @Post()
  async createFolder(
    @Body('name') name: string,
    @Body('ownerId') ownerId: string,
    @Body('parentFolderId') parentFolderId: string = null,
  ) {
    return this.folderService.createFolder(name, ownerId, parentFolderId);
  }

  // Get all folders by ownerId
  @Get(':ownerId')
  async getFoldersByOwner(@Param('ownerId') ownerId: string) {
    return this.folderService.getFoldersByOwner(ownerId);
  }

  // Get folder by ID
  @Get(':id')
  async getFolderById(@Param('id') id: string) {
    return this.folderService.getFolderById(id);
  }

  // Update folder
  @Put(':id')
  async updateFolder(
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return this.folderService.updateFolder(id, name);
  }

  // Delete folder
  @Delete(':id')
  async deleteFolder(@Param('id') id: string) {
    return this.folderService.deleteFolder(id);
  }
}
