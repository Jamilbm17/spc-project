import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { Participant } from './entities/participant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Participant])],
    providers: [ParticipantsService],
    controllers: [ParticipantsController],
    exports: [ParticipantsService],
})
export class ParticipantsModule { }
