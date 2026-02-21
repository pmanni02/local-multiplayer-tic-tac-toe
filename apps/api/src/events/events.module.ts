import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RegularGameService } from 'src/services/regularGame.service';

@Module({
  providers: [EventsGateway, RegularGameService],
})
export class EventsModule {}
