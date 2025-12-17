import axios from "axios";
import { logger } from "../utils/logger";

const EZTEXTING_API_KEY = process.env.EZTEXTING_API_KEY;
const EZTEXTING_API_SECRET = process.env.EZTEXTING_API_SECRET;
const EZTEXTING_API_URL = "https://a.eztexting.com/v1/messages";
const EZTEXTING_CONTACTS_URL = "https://a.eztexting.com/v1/contacts";

export interface EZTextingSMSData {
  to: string;
  body: string;
}

export interface EZTextingContactData {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  note?: string;
  custom1?: string;
  custom2?: string;
  custom3?: string;
  custom4?: string;
  custom5?: string;
  groupIds?: string[];
}

class EZTextingService {
  async sendSMS({ to, body }: EZTextingSMSData): Promise<boolean> {
    try {
      const response = await axios.post(
        EZTEXTING_API_URL,
        {
          toNumbers: [to],
          message: body,
          companyName: "GTOA",
        },
        {
          auth: {
            username: EZTEXTING_API_KEY!,
            password: EZTEXTING_API_SECRET!,
          },
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      );
      logger.info("EZTexting SMS response:", response.data);
      // Check for success status in response
      return response.data && response.data.success === true;
    } catch (error) {
      logger.error("EZTexting SMS error:", error);
      return false;
    }
  }

  // Helper for game account approval SMS
  async sendGameAccountApprovalSMS(
    phoneNumber: string,
    data: {
      userName: string;
      gameName: string;
      username: string;
      password: string;
      adminNotes?: string;
    }
  ): Promise<boolean> {
    const body = `(GTOA) 🎮 Game Account Approved!

Hello ${data.userName},

Your ${data.gameName} account request has been approved!

Username: ${data.username}
Password: ${data.password}

You can now log in and start playing!

💡 IMPORTANT:
When you log in, you'll see two options:

* ADD GAME LOOT – Transfer Gold Coins from your wallet to the game for continued play
* REDEEM GAME LOOT – Submit eligible Sweeps Coins (SC) won through gameplay for a chance to receive a reward, per our Sweepstakes Rules

${data.adminNotes ? `Note: ${data.adminNotes}` : ""}

For support, contact us anytime:
DM 💬 http://m.me/105542688498394
Text 📱 702-356-3435

Thank you for choosing GTOA!
`;

    return this.sendSMS({ to: phoneNumber, body });
  }

  async sendGameAccountRejectedSMS(
    phoneNumber: string,
    data: { userName: string; gameName: string; adminNotes: string }
  ): Promise<boolean> {
    const body = `🎮 Game Account Rejected!\n\nHello ${data.userName},\n\nYour ${data.gameName} account request has been rejected!\n\nReason: ${data.adminNotes}\n\nFor support, contact our team.\n\nThank you for choosing us!`;
    return this.sendSMS({ to: phoneNumber, body });
  }

  // Add or update a contact in EZ Texting
  async addOrUpdateContact(contact: EZTextingContactData): Promise<boolean> {
    try {
      const response = await axios.post(EZTEXTING_CONTACTS_URL, contact, {
        auth: {
          username: EZTEXTING_API_KEY!,
          password: EZTEXTING_API_SECRET!,
        },
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
      });
      logger.info("EZTexting contact add/update response:", response.data);
      return response.data && response.data.success === true;
    } catch (error) {
      logger.error("EZTexting contact add/update error:", error);
      return false;
    }
  }
}

const ezTextingService = new EZTextingService();
export default ezTextingService;
