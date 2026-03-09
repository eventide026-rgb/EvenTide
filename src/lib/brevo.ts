/**
 * @fileOverview Brevo (formerly Sendinblue) Transactional Email Utility.
 * Requires the following environment variables:
 * - BREVO_API_KEY
 * - BREVO_SENDER_EMAIL
 * - BREVO_SENDER_NAME
 */

import * as SibApiV3Sdk from 'sib-api-v3-sdk';

// Initialize the Brevo client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';

const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send a transactional email using Brevo
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param htmlContent - The HTML body of the email
 * @returns - The API response data
 */
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY is not set. Email delivery will be skipped.');
    return null;
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { 
    name: process.env.BREVO_SENDER_NAME || 'EvenTide', 
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@eventide.app' 
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
    console.log('Brevo Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    throw error;
  }
}
