// Session模块
import { Module, Global } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Global()
@Module({
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
