// Agent模块
import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { TaskRouterService } from './task-router.service';

@Module({
  providers: [AgentService, TaskRouterService],
  exports: [AgentService],
})
export class AgentModule {}
