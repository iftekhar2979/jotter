import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { LifestyleService } from './lifestyle.service';
import { LifeStyleOnServiceDto } from './dto/lifestyle.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role-gurad';
import { Roles } from 'src/common/custom-decorator/role.decorator';
import { LifeStyleDto } from 'src/profile/dto/lifeStyleAndValues.dto';
// import { LifeStyle } from './dto/lifestyle.dto';  // LifeStyle schema

@Controller('lifestyle')
export class LifeStyleController {
  constructor(private readonly lifeStyleService: LifestyleService) {}
  // CREATE: Create a new lifestyle entry
  @Post()
  async createLifeStyle(@Body() lifeStyleDto: LifeStyleOnServiceDto): Promise<any> {
    return this.lifeStyleService.createLifeStyle(lifeStyleDto);
  }

  // READ: Get lifestyle by userID
  @Get(':userID')
  async getLifeStyleByUserID(@Param('userID') userID: string): Promise<any> {
    return this.lifeStyleService.getLifeStyleByUserID(userID);
  }

  // UPDATE: Update lifestyle by ID
  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async updateLifeStyle(
    @Request() req,
    @Body() lifeStyleDto: LifeStyleDto,
  ): Promise<any> {
    let id= req.user.id

    return this.lifeStyleService.updateLifeStyle(id, lifeStyleDto);
  }

  // DELETE: Delete lifestyle by ID
  @Delete(':id')
  async deleteLifeStyle(@Param('id') id: string): Promise<any> {
    return this.lifeStyleService.deleteLifeStyle(id);
  }
}
