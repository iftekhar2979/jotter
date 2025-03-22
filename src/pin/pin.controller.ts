import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LockService } from './pin.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role-gurad';
import { Roles } from 'src/common/custom-decorator/role.decorator';
import { LockFileDto } from './lock.dto';
import { PinGuard } from 'src/auth/guard/check-pin';

@Controller('lock')
export class PinController {
  constructor(private lockService: LockService) {}
  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  lockFile(@Request() req, @Query() file: LockFileDto) {
    return this.lockService.lockFile({
      userId: req.user.id,
      fileId: file.fileId,
    });
  }
  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard, PinGuard)
  @Roles('user')
  getLocks(
    @Request() req,
    @Query()
    { term, page, limit }: { term?: string; page: any; limit: any },
  ) {
    if (page || limit) {
      page = parseFloat(page as string);
      limit = parseFloat(limit as string);
    }
    return this.lockService.getFiles({
      userId: req.user.id,
      page,
      searchTerm: term,
      limit,
    });
  }
}
