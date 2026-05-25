// Tools模块
import { Module, Global } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CodeGeneratorTool } from './code-generator.tool';
import { DocGeneratorTool } from './doc-generator.tool';
import { ErrorAnalyzerTool } from './error-analyzer.tool';
import { FileProcessorTool } from './file-processor.tool';

@Global()
@Module({
  providers: [ToolsService, CodeGeneratorTool, DocGeneratorTool, ErrorAnalyzerTool, FileProcessorTool],
  exports: [ToolsService],
})
export class ToolsModule {}
