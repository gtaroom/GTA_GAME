import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MailOptions, MailOptions2 } from "../types/types";

// Brand colors
const BRAND_COLORS = {
  primary: "#fde049", // Gold
  secondary: "#bdf8c7", // Light green
  background: "#310a47", // Deep purple (updated)
  text: "#ffffff", // White
  accent: "#ff6b6b", // Neon accent
  darkText: "#2c3e50", // Dark text for contrast
};

/**
 * Generate branded HTML email template
 * @param {string} title - Email title
 * @param {string} content - Main content HTML
 * @param {string} buttonText - Button text (optional)
 * @param {string} buttonLink - Button link (optional)
 * @param {string} logoUrl - Logo URL (optional)
 * @returns {string} Complete HTML email template
 */
const generateBrandedEmailTemplate = (
  title: string,
  content: string,
  buttonText?: string,
  buttonLink?: string,
  logoUrl?: string
): string => {
  const logoHtml = logoUrl
    ? `
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="${logoUrl}" alt="Golden Ticket Online Arcade" style="max-width: 200px; height: auto;" />
    </div>
  `
    : "";

  const buttonHtml =
    buttonText && buttonLink
      ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #ffd700 100%); border-radius: 30px; text-align: center;">
                <a href="${buttonLink}" style="display: inline-block; padding: 20px 40px; text-decoration: none; color: ${BRAND_COLORS.darkText}; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; font-family: Arial, sans-serif;">
                  ${buttonText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
      : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${BRAND_COLORS.background}; font-family: Arial, sans-serif;">
      <!-- Email Container -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND_COLORS.background};">
        <tr>
          <td align="center" style="padding: 20px;">
            <!-- Email Wrapper -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: ${BRAND_COLORS.background}; border-radius: 20px; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #ffd700 100%); padding: 40px 30px; text-align: center;">
                  ${logoHtml}
                  <h1 style="color: ${BRAND_COLORS.darkText}; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); letter-spacing: 1px; font-family: Arial, sans-serif;">${title}</h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 50px 40px; color: ${BRAND_COLORS.text}; line-height: 1.7; background-color: ${BRAND_COLORS.background};">
                  <div style="font-size: 18px; margin-bottom: 30px;">
                    ${content}
                  </div>
                  ${buttonHtml}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: rgba(0, 0, 0, 0.3); padding: 30px 40px; text-align: center; color: ${BRAND_COLORS.text}; font-size: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                  <p style="margin: 0 0 20px 0;">Need help, or have questions? Just reply to this email, we'd love to help.</p>
                  <p style="margin: 0; color: ${BRAND_COLORS.primary}; font-weight: 600;">
                    Yours truly,<br>
                    <span style="color: ${BRAND_COLORS.primary}; font-weight: 600;">Golden Ticket Online Arcade & Casino</span>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 *
 * @param {{email: string; subject: string; mailgenContent: Mailgen.Content; }} options
 */
const sendEmail = async (options: MailOptions) => {
  const smtpConfig: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
  const transporter = nodemailer.createTransport(smtpConfig);

  let emailHtml: string;
  let emailTextual: string;

  // Check if options.mailgenContent is a string (new branded template) or object (old Mailgen format)
  if (typeof options.mailgenContent === "string") {
    // New branded template format
    emailHtml = options.mailgenContent;
    emailTextual = options.subject || "Golden Ticket Online Arcade & Casino";
  } else {
    // Old Mailgen format - keep backward compatibility
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "GOLDEN TICKET ONLINE ARCADE AND CASINO",
        link: "https://gtoarcade.com",
      },
    });

    emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    emailHtml = mailGenerator.generate(options.mailgenContent);
  }

  const mail = {
    from: process.env.SMTP_USER,
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    console.error(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    console.error("Error: ", error);
  }
};

const sendEmailNotify = async (options: MailOptions2) => {
  const smtpConfig: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
  const transporter = nodemailer.createTransport(smtpConfig);

  // Extract title from subject or use default
  const title = options.subject || "Golden Ticket Online Arcade & Casino";

  // Use branded template instead of raw HTML
  const brandedHtml = generateBrandedEmailTemplate(
    title,
    options.mailgenContent,
    undefined, // No button by default
    undefined, // No button link
    process.env.LOGO_URL // Logo URL from environment
  );

  const mail = {
    from: process.env.SMTP_USER,
    to: options.email, // mail receiver
    subject: options.subject, // mail subject
    html: brandedHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    console.error(
      "Email notification service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    console.error("Error: ", error);
  }
};

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the email verification mail
 */
const emailVerificationMailgenContent = (
  username: string,
  verificationUrl: string
) => {
  const giftIconUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL}/modal/gift-icon.png`
    : "";

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 40px;">
      <tr>
        <td align="center">
          ${giftIconUrl ? `<img src="${giftIconUrl}" alt="Gift" style="width: 80px; height: 80px; margin: 20px auto; display: block;" />` : '<div style="font-size: 60px; margin-bottom: 20px; text-align: center;">🎁</div>'}
          <div style="font-size: 24px; font-weight: 600; color: ${BRAND_COLORS.primary}; margin: 20px 0; text-align: center;">Welcome to GTOA Family!</div>
        </td>
      </tr>
    </table>
    
    <div style="font-size: 20px; margin: 30px 0 20px 0;">Hi <span style="color: ${BRAND_COLORS.primary}; font-weight: 600;">${username}</span>,</div>
    
    <div style="font-size: 18px; margin: 20px 0;">
     Welcome to Golden Ticket Online Arcade! We’re very excited to have you as part of the GTOA Family.
      To verify your email address, click the button below. 
      <span style="text-shadow: 0 0 10px ${BRAND_COLORS.accent}, 0 0 20px ${BRAND_COLORS.accent}, 0 0 30px ${BRAND_COLORS.accent};">This link will expire in 20 minutes.</span>
    </div>
    
    <div style="font-size: 16px; color: ${BRAND_COLORS.secondary}; margin: 20px 0;">
      If the link has expired, you can click on it to generate a new verification link.
    </div>
  `;

  return generateBrandedEmailTemplate(
    "PLEASE VERIFY YOUR EMAIL",
    content,
    "VERIFY EMAIL",
    verificationUrl,
    process.env.LOGO_URL
  );
};

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the forgot password mail
 */
const forgotPasswordMailgenContent = (
  username: string,
  passwordResetUrl: string
) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
      <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">Password Reset Request</h2>
    </div>
    
    <p style="font-size: 18px; margin-bottom: 25px;">Hi <span class="highlight">${username}</span>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We got a request to reset the password of your account. 
      Don't worry, this happens to the best of us!
    </p>
    
    <p style="font-size: 14px; color: ${BRAND_COLORS.secondary}; margin-bottom: 30px;">
      Click the button below to reset your password. This link will expire in 20 minutes for security reasons.
    </p>
  `;

  return generateBrandedEmailTemplate(
    "RESET YOUR PASSWORD",
    content,
    "RESET PASSWORD",
    passwordResetUrl,
    process.env.LOGO_URL
  );
};

/**
 * Generate branded notification content for admin emails
 * @param {string} title - Notification title
 * @param {Object} data - Notification data
 * @param {string} type - Type of notification
 * @returns {string} Branded HTML content
 */
const generateAdminNotificationContent = (
  title: string,
  data: any,
  type: string
): string => {
  let icon = "📧";
  let content = "";

  switch (type) {
    case "recharge_request":
      icon = "💰";
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: ${BRAND_COLORS.primary}; margin-top: 0;">Request Details</h3>
          <p><strong>User:</strong> ${data.userName || "N/A"} (${data.userEmail || "N/A"})</p>
          <p><strong>Game:</strong> ${data.gameName || "N/A"}</p>
          <p><strong>Username:</strong> ${data.username || "N/A"}</p>
          <p><strong>Amount:</strong> ${data.amount || "N/A"} ${data.currency || "GC"}</p>
          <p><strong>Equivalent To:</strong> ${data.usdAmount || "N/A"} USD</p>
          <p><strong>Request ID:</strong> ${data.requestId || "N/A"}</p>
          <p><strong>Status:</strong> <span class="highlight">${data.status || "Pending"}</span></p>
        </div>
        
        <p style="font-size: 16px; color: ${BRAND_COLORS.secondary};">
          Please review and process this request in the admin dashboard.
        </p>
      `;
      break;

    case "withdrawal_request":
      icon = "💸";
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: ${BRAND_COLORS.primary}; margin-top: 0;">Withdrawal Details</h3>
          <p><strong>User:</strong> ${data.userName || "N/A"} (${data.userEmail || "N/A"})</p>
          <p><strong>Amount:</strong> ${data.amount || "N/A"} ${data.currency || "SC"}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod || "N/A"}</p>
          <p><strong>Account Details:</strong> ${data.accountDetails || "N/A"}</p>
          <p><strong>Request ID:</strong> ${data.requestId || "N/A"}</p>
          <p><strong>Status:</strong> <span class="highlight">${data.status || "Pending"}</span></p>
        </div>
        
        <p style="font-size: 16px; color: ${BRAND_COLORS.secondary};">
          Please review and process this withdrawal request.
        </p>
      `;
      break;

    case "game_account_request":
      icon = "🎮";
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: ${BRAND_COLORS.primary}; margin-top: 0;">Account Request Details</h3>
          <p><strong>User:</strong> ${data.userName || "N/A"} (${data.userEmail || "N/A"})</p>
          <p><strong>Game:</strong> ${data.gameName || "N/A"}</p>
          <p><strong>Request Type:</strong> ${data.requestType || "N/A"}</p>
          <p><strong>Request ID:</strong> ${data.requestId || "N/A"}</p>
          <p><strong>Status:</strong> <span class="highlight">${data.status || "Pending"}</span></p>
        </div>
        
        <p style="font-size: 16px; color: ${BRAND_COLORS.secondary};">
          Please review and process this game account request.
        </p>
      `;
      break;

    default:
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <pre style="color: ${BRAND_COLORS.text}; white-space: pre-wrap; font-family: inherit;">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
  }

  return content;
};

/**
 * Generate branded notification content for user emails
 * @param {string} title - Notification title
 * @param {Object} data - Notification data
 * @param {string} type - Type of notification
 * @param {string} buttonText - Optional button text
 * @param {string} buttonLink - Optional button link
 * @returns {string} Branded HTML content
 */
const generateUserNotificationContent = (
  title: string,
  data: any,
  type: string,
  buttonText?: string,
  buttonLink?: string
): string => {
  let icon = "📧";
  let content = "";

  switch (type) {
    case "recharge_approved":
      icon = "✅";
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <p style="font-size: 18px; margin-bottom: 25px;">Hi <span class="highlight">${data.userName || "Valued Player"}</span>,</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Great news! Your request to deposit coins in <span class="highlight">${data.gameName}</span> has been approved.
        </p>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: ${BRAND_COLORS.primary}; margin-top: 0;">Transaction Details</h3>
          <p><strong>Game:</strong> ${data.gameName}</p>
          <p><strong>Amount:</strong> ${data.amount} gold coins (worth: ${data.usdAmount} USD)</p>
          <p><strong>Game Coins:</strong> ${data.gameCoins} game coins</p>
          <p><strong>Status:</strong> <span class="highlight">Approved</span></p>
          <p><strong>Request ID:</strong> ${data.requestId}</p>
        </div>
        
        <p style="font-size: 16px; color: ${BRAND_COLORS.secondary};">
          You can now enjoy playing! If you have any questions, please contact our support team.
        </p>
      `;
      break;

    case "recharge_rejected":
      icon = "❌";
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.accent}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <p style="font-size: 18px; margin-bottom: 25px;">Hi <span class="highlight">${data.userName || "Valued Player"}</span>,</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We're sorry, but your request to deposit amount in <span class="highlight">${data.gameName}</span> was rejected.
        </p>
        
        <div style="background: rgba(255, 107, 107, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: ${BRAND_COLORS.accent}; margin-top: 0;">Transaction Details</h3>
          <p><strong>Game:</strong> ${data.gameName}</p>
          <p><strong>Amount:</strong> ${data.amount} GC (worth: ${data.usdAmount} USD)</p>
          <p><strong>Status:</strong> <span style="color: ${BRAND_COLORS.accent};">Rejected</span></p>
          <p><strong>Reason:</strong> ${data.reason || "Not specified"}</p>
        </div>
        
        <p style="font-size: 16px; color: ${BRAND_COLORS.secondary};">
          The amount has been refunded to your wallet. Please contact support if you have any questions.
        </p>
      `;
      break;

    case "game_account_approved":
      icon = "🎉";
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <p style="font-size: 18px; margin-bottom: 25px;">Hi <span class="highlight">${data.userName || "Valued Player"}</span>,</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Congratulations! Your game account request for <span class="highlight">${data.gameName}</span> has been approved.
        </p>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: ${BRAND_COLORS.primary}; margin-top: 0;">Account Details</h3>
          <p><strong>Game:</strong> ${data.gameName}</p>
          <p><strong>Username:</strong> ${data.username}</p>
          <p><strong>Password:</strong> ${data.password}</p>
          <p><strong>Status:</strong> <span class="highlight">Active</span></p>
        </div>
        
        <p style="font-size: 16px; color: ${BRAND_COLORS.secondary};">
          You can now start playing! Keep your credentials safe and don't share them with anyone.
        </p>
      `;
      break;

    default:
      content = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
          <h2 style="color: ${BRAND_COLORS.primary}; margin: 0; font-size: 24px;">${title}</h2>
        </div>
        
        <p style="font-size: 18px; margin-bottom: 25px;">Hi <span class="highlight">${data.userName || "Valued Player"}</span>,</p>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <pre style="color: ${BRAND_COLORS.text}; white-space: pre-wrap; font-family: inherit;">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
  }

  return generateBrandedEmailTemplate(
    title,
    content,
    buttonText,
    buttonLink,
    process.env.LOGO_URL
  );
};

export {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmailNotify,
  generateBrandedEmailTemplate,
  generateAdminNotificationContent,
  generateUserNotificationContent,
};
