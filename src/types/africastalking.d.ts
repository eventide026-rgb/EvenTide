
declare module "africastalking" {
    interface AfricasTalkingConfig {
      apiKey: string;
      username: string;
    }
  
    interface SMSOptions {
      to: string[];
      message: string;
    }
  
    interface SMSResponse {
      SMSMessageData: any;
    }
  
    interface AfricasTalkingInstance {
      SMS: {
        send(options: SMSOptions): Promise<SMSResponse>;
      };
    }
  
    export default function AfricasTalking(
      config: AfricasTalkingConfig
    ): AfricasTalkingInstance;
  }