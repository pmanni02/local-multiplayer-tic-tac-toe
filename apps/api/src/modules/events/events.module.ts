import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomsManagerService } from './roomsManager.service';

@Module({
  providers: [EventsGateway, RoomsManagerService],
})
export class EventsModule {}
