import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { BorrowsController } from './borrows.controller.js';
import { BorrowsService } from './borrows.service.js';

@Module({
  imports: [MailModule],
  controllers: [BorrowsController],
  providers: [BorrowsService],
})
export class BorrowsModule {}
