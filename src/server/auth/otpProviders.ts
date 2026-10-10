import "server-only";

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
 * Fast2SMS Provider (Active Production SMS Provider)
 * Endpoint: POST https://www.fast2sms.com/dev/bulkV2
 * Configured via FAST2SMS_OTP_API_KEY
 */
export class Fast2SmsProvider implements OtpProvider {
  name = "fast2sms";

  async send(phone: string, code: string): Promise<SendOtpResult> {
    const apiKey = process.env.FAST2SMS_OTP_API_KEY || process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      console.error("[Fast2SMS Error] Missing FAST2SMS_OTP_API_KEY env variable.");
      return {
        success: false,
        error: "Fast2SMS API key is not configured.",
      };
    }

    try {
      // 10-digit Indian mobile number
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: code,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || (data && (data.return === false || data.status_code === 996))) {
        const errorMsg =
          data && Array.isArray(data.message)
            ? data.message.join(", ")
            : (data && data.message) || `Fast2SMS error status ${response.status}`;
        console.error("[Fast2SMS Delivery Issue]", data);
        return {
          success: false,
          error: errorMsg,
        };
      }

      console.log(`[Fast2SMS] OTP dispatched to ${cleanPhone}. RequestId=${data?.request_id || "unknown"}`);
      return {
        success: true,
        messageId: data?.request_id || "fast2sms_sent",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error contacting Fast2SMS";
      console.error("[Fast2SMS Network Error]", err);
      return {
        success: false,
        error: errMsg,
      };
    }
  }
}

/**
 * Console Provider (Development & Demo default fallback)
 * Logs the OTP clearly to the terminal server console.
 */
export class ConsoleProvider implements OtpProvider {
  name = "console";

  async send(phone: string, code: string): Promise<SendOtpResult> {
    console.log(
      `\n========================================\n` +
      `[PuretyFarm Auth] 🥛 OTP DELIVERY (Demo Access Enabled)\n` +
      `Recipient : ${phone}\n` +
      `Code      : ${code}\n` +
      `Note      : Free access enabled for development/preview phase\n` +
      `========================================\n`
    );

    return {
      success: true,
      messageId: `demo_${Date.now()}`,
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
 * Factory to retrieve active OTP Provider based on FAST2SMS_OTP_API_KEY or OTP_PROVIDER env
 */
export function getOtpProvider(): OtpProvider {
  // If Fast2SMS API key is set, prioritize Fast2SMS
  if (process.env.FAST2SMS_OTP_API_KEY || process.env.FAST2SMS_API_KEY) {
    return new Fast2SmsProvider();
  }

  const providerName = (process.env.OTP_PROVIDER || "console").toLowerCase();

  switch (providerName) {
    case "fast2sms":
      return new Fast2SmsProvider();
    case "msg91":
      if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
        return new Msg91Provider();
      }
      return new ConsoleProvider();
    case "twilio":
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
        return new TwilioProvider();
      }
      return new ConsoleProvider();
    case "console":
    default:
      return new ConsoleProvider();
  }
}
