import { Module } from '@nestjs/common';
// import { createObserveModule } from '@nestjs/observe';
import { TicketsModule } from './tickets/tickets.module.js';

// export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    // we dont need that for now, as we need to login and get these value, we can start the projects without that as well, 
    TicketsModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}



// his is a root module , 
//common prefix, 