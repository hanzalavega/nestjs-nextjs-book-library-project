import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';

@Module({
  imports: [MailModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
