import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LifeStyle, LifeStyleSchema } from './lifestyle.schema';
import { LifestyleService } from './lifestyle.service';
import { LifeStyleController } from './lifestyle.controller';
import { ProfileModule } from 'src/profile/profile.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LifeStyle.name, schema: LifeStyleSchema },
    ]),
    JwtModule.register({
      secret: 'yourSecretKey', // You should move this to a config file or env variables
      signOptions: { expiresIn: '30d' }, // Token expiration time
    }),
    UsersModule
  ],
  providers: [LifestyleService],
  controllers: [LifeStyleController],
  exports: [LifestyleService], // need exporting if i want to use the service into another services
})
export class LifestyleModule {}
