import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
    if (process.env.MAIL_ENABLED !== 'true') {
      return;
    }

    const html = await this.renderTemplate('student-created.hbs', {
      student,
    });
    const recipient = student.email || process.env.MAIL_TO;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: recipient,
      subject: `Student created: ${student.name}`,
      html,
    });
  }

  async sendBorrowConfirmationEmail(borrow: {
    borrowedAt: Date;
    dueAt: Date | null;
    student: { name: string; email: string };
    book: { title: string };
  }) {
    if (process.env.MAIL_ENABLED !== 'true') return;

    const dates = {
      borrowedAt: borrow.borrowedAt.toLocaleDateString(),
      dueAt: borrow.dueAt?.toLocaleDateString(),
    };
    const html = await this.renderTemplate('borrow-confirmation.hbs', {
      ...borrow,
      ...dates,
    });
    const receipt = await this.createBorrowReceipt(borrow);
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: borrow.student.email,
      subject: `Borrow confirmation: ${borrow.book.title}`,
      html,
      attachments: [
        {
          filename: `borrow-receipt-${borrow.borrowedAt.getTime()}.pdf`,
          content: receipt,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  private async createBorrowReceipt(borrow: {
    borrowedAt: Date;
    dueAt: Date | null;
    student: { name: string; email: string };
    book: { title: string };
  }) {
    const document = await PDFDocument.create();
    const page = document.addPage([595, 842]);
    const font = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);
    page.drawText('Book Library Management', {
      x: 55,
      y: 770,
      size: 20,
      font: bold,
      color: rgb(0.12, 0.2, 0.32),
    });
    page.drawText('Borrow receipt', { x: 55, y: 735, size: 14, font: bold });
    const rows = [
      `Student: ${borrow.student.name}`,
      `Email: ${borrow.student.email}`,
      `Book: ${borrow.book.title}`,
      `Borrow date: ${borrow.borrowedAt.toLocaleDateString()}`,
      `Due date: ${borrow.dueAt?.toLocaleDateString() ?? 'Not set'}`,
    ];
    rows.forEach((text, index) =>
      page.drawText(text, { x: 55, y: 690 - index * 30, size: 12, font }),
    );
    return Buffer.from(await document.save());
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
