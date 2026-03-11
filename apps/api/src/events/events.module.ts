import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomsManagerService } from 'src/services/roomsManager.service';

@Module({
  providers: [EventsGateway, RoomsManagerService],
})
export class EventsModule {}
