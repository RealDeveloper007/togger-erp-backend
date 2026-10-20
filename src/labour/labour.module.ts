import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabourRate } from './entities/labour-rate.entity';
import { LabourService } from './labour.service';
import { LabourController } from './labour.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabourRate])],
  controllers: [LabourController],
  providers: [LabourService],
  exports: [LabourService],
})
export class LabourModule {}
