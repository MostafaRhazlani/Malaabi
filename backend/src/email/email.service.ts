import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly from = process.env.RESEND_FROM_EMAIL!;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY!;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    this.resend = new Resend(apiKey);
  }

  async sendManagerCredentials(
    to: string,
    firstName: string,
    password: string,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Welcome to Malaabi — Your Manager Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h2 style="color: #a78bfa; margin-bottom: 8px;">Welcome to Malaabi, ${firstName}!</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Your manager account has been created. Here are your login credentials:</p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px;"><span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Email</span><br /><strong style="color: #f1f5f9;">${to}</strong></p>
            <p style="margin: 0;"><span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Temporary Password</span><br /><strong style="color: #f1f5f9; font-family: monospace; font-size: 16px;">${password}</strong></p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Please log in and change your password as soon as possible.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error('Failed to send manager credentials email', error);
      throw new InternalServerErrorException(
        'Failed to send credentials email',
      );
    }
  }
}
