export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  devOtpHint?: string; // Only populated in non-production ConsoleProvider
}

export interface OtpProvider {
  name: string;
  send(phone: string, code: string): Promise<SendOtpResult>;
}

/**
 * Console Provider (Development & Demo default)
 * Logs the OTP clearly to the terminal server console.
 * In development, returns devOtpHint for frictionless local testing and demoing without SMS credentials.
 * In production, if console provider is invoked, fails securely with "OTP service not configured".
 */
export class ConsoleProvider implements OtpProvider {
  name = "console";

  async send(phone: string, code: string): Promise<SendOtpResult> {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[PuretyFarm Security] Production environment detected with ConsoleProvider active. Refusing to send/log OTP."
      );
      return {
        success: false,
        error: "OTP service not configured. Please set OTP_PROVIDER to a supported SMS provider.",
      };
    }

    console.log(
      `\n========================================\n` +
      `[PuretyFarm Auth] 🥛 OTP DELIVERY\n` +
      `Recipient : ${phone}\n` +
      `Code      : ${code}\n` +
      `Expires In: 5 minutes\n` +
      `========================================\n`
    );

    return {
      success: true,
      messageId: `console_${Date.now()}`,
      devOtpHint: code,
    };
  }
}

/**
 * MSG91 SMS Provider Stub
 * Configured via MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, MSG91_SENDER_ID
 */
export class Msg91Provider implements OtpProvider {
  name = "msg91";

  async send(phone: string, code: string): Promise<SendOtpResult> {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      console.error("[MSG91 Error] Missing MSG91_AUTH_KEY or MSG91_TEMPLATE_ID env variables.");
      return {
        success: false,
        error: "MSG91 SMS credentials are not configured.",
      };
    }

    try {
      // Clean mobile number (strip '+')
      const cleanPhone = phone.replace(/^\+/, "");
      
      const response = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: authKey,
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: cleanPhone,
          otp: code,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.type === "error") {
        return {
          success: false,
          error: data.message || "Failed to send OTP via MSG91.",
        };
      }

      return {
        success: true,
        messageId: data.message || "msg91_sent",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error contacting MSG91";
      return {
        success: false,
        error: errMsg,
      };
    }
  }
}

/**
 * Twilio SMS / Verify Provider Stub
 * Configured via TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER or TWILIO_VERIFY_SERVICE_SID
 */
export class TwilioProvider implements OtpProvider {
  name = "twilio";

  async send(phone: string, code: string): Promise<SendOtpResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("[Twilio Error] Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN or TWILIO_FROM_NUMBER.");
      return {
        success: false,
        error: "Twilio credentials are not configured.",
      };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("To", phone);
      params.append("From", fromNumber);
      params.append(
        "Body",
        `Your PuretyFarm verification code is ${code}. Valid for 5 minutes. Do not share this with anyone.`
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Failed to send OTP via Twilio.",
        };
      }

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error contacting Twilio";
      return {
        success: false,
        error: errMsg,
      };
    }
  }
}

/**
 * Factory to retrieve active OTP Provider based on OTP_PROVIDER env
 */
export function getOtpProvider(): OtpProvider {
  const providerName = (process.env.OTP_PROVIDER || "console").toLowerCase();

  switch (providerName) {
    case "msg91":
      return new Msg91Provider();
    case "twilio":
      return new TwilioProvider();
    case "console":
    default:
      return new ConsoleProvider();
  }
}
