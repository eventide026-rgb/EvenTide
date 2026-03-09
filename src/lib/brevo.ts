
/**
 * @fileOverview Brevo Transactional Email Utility.
 * Replaced legacy sib-api-v3-sdk with modern @getbrevo/brevo for high-performance delivery.
 * Requires the following environment variables:
 * - BREVO_API_KEY
 * - BREVO_SENDER_EMAIL
 * - BREVO_SENDER_NAME
 */

import * as Brevo from '@getbrevo/brevo';

let apiInstance: Brevo.TransactionalEmailsApi | null = null;

function getBrevoApi() {
  if (apiInstance) return apiInstance;
  
  if (process.env.BREVO_API_KEY) {
    apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    return apiInstance;
  }
  
  return null;
}

/**
 * Send a transactional email using Brevo
 */
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const api = getBrevoApi();
  
  if (!api) {
    console.warn('Brevo API not initialized (Missing BREVO_API_KEY). Email delivery will be skipped.');
    return null;
  }

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { 
    name: process.env.BREVO_SENDER_NAME || 'EvenTide', 
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@eventide.app' 
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await api.sendTransacEmail(sendSmtpEmail);
    console.log('Brevo Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    throw error;
  }
}
