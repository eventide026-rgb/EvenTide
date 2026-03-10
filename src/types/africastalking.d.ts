declare module "africastalking" {
  interface SMS {
    send(options: { to: string | string[]; message: string }): Promise<any>;
  }

  interface Africastalking {
    SMS: SMS;
    PAYLOADS?: {
      WhatsApp: any;
    };
    AIRTIME?: any;
  }

  function Africastalking(options: { apiKey: string; username: string }): Africastalking;

  export = Africastalking;
}
