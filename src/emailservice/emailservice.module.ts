import { Module } from '@nestjs/common';
import { EmailService } from './emailservice.service';
// import { EmailserviceService } from './emailservice.service';

@Module({
  providers: [EmailService],
  exports:[EmailService]
})
export class EmailserviceModule {}
