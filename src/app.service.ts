import { Injectable, OnModuleInit } from '@nestjs/common';
import { Mongoose } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectConnection() private readonly mongooseConnection: any) {}
  async onModuleInit() {
    let connectionState=this.mongooseConnection?.base.STATES.connected
    if (connectionState === 1) {
      console.log('Mongoose is connected');
    } else {
      console.log('Mongoose is not connected');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
