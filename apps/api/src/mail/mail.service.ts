import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';

type StudentCreatedEmailData = {
  name: string;
  email: string;
  department?: string | null;
};

@Injectable()
export class MailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 2525),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendStudentCreatedEmail(student: StudentCreatedEmailData) {
    const html = await this.renderTemplate('student-created.hbs', {
      student,
    });

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: `Student created: ${student.name}`,
      html,
    });
  }

  private async renderTemplate(templateName: string, context: object) {
    const templatePath = path.join(this.getTemplatesDirectory(), templateName);
    const template = await fs.readFile(templatePath, 'utf8');

    return Handlebars.compile(template)(context);
  }

  private getTemplatesDirectory() {
    const currentFile = fileURLToPath(import.meta.url);
    return path.join(path.dirname(currentFile), 'templates');
  }
}
