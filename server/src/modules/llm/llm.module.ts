// LLM模块
import { Module, Global } from '@nestjs/common';
import { LlmService } from './llm.service';
import { DeepSeekProvider } from './deepseek.provider';

@Global()
@Module({
  providers: [LlmService, DeepSeekProvider],
  exports: [LlmService],
})
export class LlmModule {}
