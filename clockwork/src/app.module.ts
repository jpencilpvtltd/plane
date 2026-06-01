import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ClockworkModule } from "./clockwork/clockwork.module.js";

@Module({
  imports: [PrismaModule, ClockworkModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
