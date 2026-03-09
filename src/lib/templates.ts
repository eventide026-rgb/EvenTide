
/**
 * @fileOverview EvenTide Notification Template Library.
 * Provides reusable message structures for Email, SMS, and WhatsApp.
 */

export type TemplateId = 
  | 'INVITATION' 
  | 'BOOKING_CONFIRMED' 
  | 'BROADCAST' 
  | 'EVENT_REMINDER' 
  | 'ACCOUNT_UPDATE';

export interface TemplateData {
  recipientName?: string;
  eventName?: string;
  eventDate?: string;
  eventCode?: string;
  guestCode?: string;
  venueName?: string;
  message?: string;
  ctaUrl?: string;
  [key: string]: any;
}

export interface NotificationContent {
  subject: string;
  text: string;
  html: string;
}

const BRAND_COLORS = {
  primary: '#4169E1', // Royal Blue
  accent: '#D4AF37',  // Gold
  sky: '#60A5FA'      // Sky Blue
};

/**
 * High-Fidelity HTML Wrapper for the Email Channel
 */
const wrapInEmailLayout = (title: string, bodyHtml: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap');
      body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; }
      .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }
      .logo { font-family: 'Playfair Display', serif; font-weight: bold; font-size: 32px; background: linear-gradient(to right, ${BRAND_COLORS.sky}, ${BRAND_COLORS.accent}); -webkit-background-clip: text; color: transparent; }
      .content { padding: 40px; color: #1e293b; line-height: 1.7; }
      .footer { padding: 24px; text-align: center; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
      h2 { color: ${BRAND_COLORS.primary}; margin-top: 0; font-weight: 700; font-size: 24px; }
      .button { display: inline-block; padding: 12px 32px; background-color: ${BRAND_COLORS.primary}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="logo">EvenTide</span>
      </div>
      <div class="content">
        <h2>${title}</h2>
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>Sent via the EvenTide Orchestration Engine. Your Event, Reimagined.</p>
        <p>&copy; ${new Date().getFullYear()} EvenTide App</p>
      </div>
    </div>
  </body>
  </html>
`;

export const getTemplate = (id: TemplateId, data: TemplateData): NotificationContent => {
  switch (id) {
    case 'INVITATION':
      return {
        subject: `Exclusive Invitation: ${data.eventName}`,
        text: `Welcome to ${data.eventName}! 🎉 Your Event Code is ${data.eventCode} and your Guest Code is ${data.guestCode}. Access your pass: ${data.ctaUrl || 'eventide.app/guest-login'}`,
        html: wrapInEmailLayout(
          'You Are Cordially Invited',
          `
          <p>Dear ${data.recipientName || 'Honored Guest'},</p>
          <p>It is our distinct pleasure to invite you to <strong>${data.eventName}</strong>.</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Event Access Codes:</p>
            <p style="margin: 5px 0; font-family: monospace; font-weight: bold; font-size: 18px;">Event: ${data.eventCode}</p>
            <p style="margin: 5px 0; font-family: monospace; font-weight: bold; font-size: 18px;">Guest: ${data.guestCode}</p>
          </div>
          <p>Please present these codes or your digital gatepass at the entrance for seamless check-in.</p>
          <a href="${data.ctaUrl || 'https://eventide.app/guest-login'}" class="button">Access Guest Portal</a>
          `
        )
      };

    case 'BOOKING_CONFIRMED':
      return {
        subject: "Event Booking Confirmed 🎉",
        text: `Your booking for ${data.eventName || data.venueName} on ${data.eventDate} has been confirmed.`,
        html: wrapInEmailLayout(
          'Booking Confirmed',
          `
          <p>Hello ${data.recipientName || 'there'},</p>
          <p>We are pleased to inform you that your booking request for <b>${data.eventName || data.venueName}</b> on <b>${data.eventDate}</b> has been <strong>successfully confirmed</strong>.</p>
          <p>The service provider is preparing for your arrival. You can view full details in your dashboard.</p>
          <a href="https://eventide.app/owner" class="button">View My Dashboard</a>
          `
        )
      };

    case 'BROADCAST':
      return {
        subject: `Live Update: ${data.eventName}`,
        text: `Broadcasting from ${data.eventName}: ${data.message}`,
        html: wrapInEmailLayout(
          'Live Event Announcement',
          `
          <p>A new announcement has been published for <strong>${data.eventName}</strong>:</p>
          <blockquote style="font-size: 18px; font-style: italic; color: #1e293b; border-left: 4px solid ${BRAND_COLORS.primary}; padding-left: 20px; margin: 30px 0;">
            "${data.message}"
          </blockquote>
          <p>Stay tuned to your guest dashboard for more live updates!</p>
          `
        )
      };

    case 'EVENT_REMINDER':
      return {
        subject: "Event Reminder ⏰",
        text: `Reminder: Your event ${data.eventName} is happening on ${data.eventDate}.`,
        html: wrapInEmailLayout(
          'Event Reminder',
          `
          <p>Friendly reminder that <b>${data.eventName}</b> is happening on <b>${data.eventDate}</b>.</p>
          <p>We look forward to seeing you there!</p>
          <a href="https://eventide.app/guest-login" class="button">View Event Details</a>
          `
        )
      };

    case 'ACCOUNT_UPDATE':
      return {
        subject: "Security Alert: Account Updated",
        text: `Hello ${data.recipientName}, your EvenTide account profile was recently updated.`,
        html: wrapInEmailLayout(
          'Account Security Update',
          `
          <p>Hello ${data.recipientName},</p>
          <p>This is an automated notification to inform you that your account profile was recently updated.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          `
        )
      };

    default:
      return {
        subject: 'EvenTide Notification',
        text: data.message || '',
        html: wrapInEmailLayout('Notification', `<p>${data.message}</p>`)
      };
  }
};
