import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [MailModule, CloudinaryModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
