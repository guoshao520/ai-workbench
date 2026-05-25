// Prompt模块
import { Module, Global } from '@nestjs/common';
import { RoleManagerService } from './role-manager.service';
import { TemplateManagerService } from './template-manager.service';

@Global()
@Module({
  providers: [RoleManagerService, TemplateManagerService],
  exports: [RoleManagerService, TemplateManagerService],
})
export class PromptModule {}
