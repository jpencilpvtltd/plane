import { Module } from "@nestjs/common";
import { ClockworkController } from "./clockwork.controller.js";
import { ClockworkService } from "./clockwork.service.js";

@Module({
  controllers: [ClockworkController],
  providers: [ClockworkService],
})
export class ClockworkModule {}
