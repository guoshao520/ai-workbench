// LLM模块
import { Module, Global } from '@nestjs/common';
import { LlmService } from './llm.service';
import { Provider } from './provider';

@Global()
@Module({
  providers: [LlmService, Provider],
  exports: [LlmService],
})
export class LlmModule {}
