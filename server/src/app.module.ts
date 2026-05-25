// 根模块
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { SessionModule } from './modules/session/session.module';
import { ChatModule } from './modules/chat/chat.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { AgentModule } from './modules/agent/agent.module';
import { ToolsModule } from './modules/tools/tools.module';
import { LlmModule } from './modules/llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    SessionModule,
    ChatModule,
    PromptModule,
    AgentModule,
    ToolsModule,
    LlmModule,
  ],
})
export class AppModule {}
