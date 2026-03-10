

declare module 'africastalking' {
    interface SMS {
      send(options: { to: string[], message: string }): Promise<any>;
    }
  
    interface Africastalking {
      SMS: SMS;
    }
  
    function Africastalking(options: { apiKey: string; username: string }): Africastalking;
  
    export = Africastalking;
  }
  