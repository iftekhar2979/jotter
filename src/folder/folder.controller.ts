import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { FolderService } from './folder.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role-gurad';
import { Roles } from 'src/common/custom-decorator/role.decorator';
// import mongoose from 'mongoose';
// import {ObjectId} from 'mongodb'
import mongoose, { ObjectId } from 'mongoose';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}
  @Post()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("user")
  async createFolder(
    @Request() req,
    @Body('name') name: string,
    @Body('parentFolderId') parentFolderId: string = null,
  ) {
    let ownerId =  new mongoose.Types.ObjectId(req.user.id);
    return this.folderService.createFolder(name, ownerId, parentFolderId);
  }

  @Get('')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("user")
  async getFoldersByOwner(
    @Request() req) {
        console.log(req.user.id)
    let ownerId =  new mongoose.Types.ObjectId(req.user.id as string) as unknown as ObjectId;
    return this.folderService.getAllFolders({ownerId});
  }

  // Get folder by ID
  @Get(':folderId')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("user")
  async getFolderById(@Param('folderId') id: string) {
    return this.folderService.getFolderById(id);
  }

  // Update folder
  @Patch(':folderId')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("user")
  async updateFolder(
    @Param('folderId') id: string,
    @Body('name') name: string,
  ) {
    return this.folderService.updateFolder(id, name);
  }

  // Delete folder
  @Delete(':folderId')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("user")
  async deleteFolder(@Param('folderId') id: string) {
    return this.folderService.deleteFolder(id);
  }
}
