import { Module } from '@nestjs/common';
import { PinController } from './pin.controller';
import { LockService } from './pin.service';
// import { PinService } from './pin.service';

@Module({
  controllers: [PinController],
  providers: [LockService]
})
export class PinModule {}
