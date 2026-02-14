import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // serve static SPA from client directory
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
