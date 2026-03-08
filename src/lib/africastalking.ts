
import Africastalking from "africastalking";

/**
 * @fileOverview Africastalking utility for SMS and Airtime services.
 * Requires AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME environment variables.
 */

const africastalking = Africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY || '',
  username: process.env.AFRICASTALKING_USERNAME || '',
});

export const sms = africastalking.SMS;
export const airtime = africastalking.AIRTIME;
