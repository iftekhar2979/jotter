import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard'; // Import the JwtAuthGuard
import { Reflector } from '@nestjs/core'; // Reflector to retrieve metadata (role) from the route handler
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';

@Injectable()
export class PinGuard extends JwtAuthGuard {
  constructor(
    private readonly reflector: Reflector,
    jwtService: JwtService,
    userService: UserService,
  ) {
    super(jwtService, userService);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user.pin === 'checked') {
      return true;
    }
    if (user.pin === 'not-set') {
      throw new BadRequestException('Set your pin first !');
    }
    if (user.pin === 'unchecked') {
      throw new ForbiddenException(
        'Please Provide the pin and preview the files!',
      );
    }
  }
}
