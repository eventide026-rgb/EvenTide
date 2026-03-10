declare module "africastalking" {
  interface SMS {
    send(options: { to: string | string[]; message: string }): Promise<any>;
  }

  interface AfricastalkingInstance {
    SMS: SMS;
  }

  function Africastalking(options: { apiKey: string; username: string }): AfricastalkingInstance;

  export = Africastalking;
}
