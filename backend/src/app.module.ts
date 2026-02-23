import { Module } from '@nestjs/common';
import { Reg156Controller } from './reg156/reg156.controller';
import { Reg156Service } from './reg156/reg156.service';

@Module({
  imports: [],
  controllers: [Reg156Controller],
  providers: [Reg156Service],
})
export class AppModule {}
