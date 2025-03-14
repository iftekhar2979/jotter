import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { Roles } from 'src/common/custom-decorator/role.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role-gurad';
import mongoose, { ObjectId } from 'mongoose';
import { Types } from 'mongoose';

@Controller('favourites')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}
  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async files(
    @Request() req,
    @Query('name') name: string,
    @Query('page') page: any,
    @Query('limit') limit: any,
  ) {
    if (page || limit) {
      page = parseFloat(page as string);
      limit = parseFloat(limit as string);
    }
    return this.favouriteService.getFavouriteFiles({
      userId: new Types.ObjectId(req.user.id),
      search: name,
      page,
      limit,
    });
  }
  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async makeFavourite(@Request() req, @Query('fileId') fileId: string) {
    return this.favouriteService.makeFavourite({
      userId: new Types.ObjectId(req.user.id) as unknown as ObjectId,
      fileId:new Types.ObjectId(fileId) as unknown as ObjectId,
    });
  }
}
