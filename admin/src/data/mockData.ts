import {
  User,
  Transaction,
  EmailTemplate,
  DashboardStats,
  RegistrationTrend,
  EngagementMetric,
} from "../types";
import { format, subDays } from "date-fns";

// Generate mock users
const generateMockUsers = (count: number): User[] => {
  const users: User[] = [];
  const subscriptionStatuses: Array<"Active" | "Inactive" | "Pending"> = [
    "Active",
    "Inactive",
    "Pending",
  ];

  for (let i = 1; i <= count; i++) {
    const registrationDate = format(
      subDays(new Date(), Math.floor(Math.random() * 365)),
      "yyyy-MM-dd"
    );
    const lastTransactionDate = format(
      subDays(new Date(), Math.floor(Math.random() * 30)),
      "yyyy-MM-dd"
    );

    users.push({
      id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      registrationDate,
      subscriptionStatus:
        subscriptionStatuses[
          Math.floor(Math.random() * subscriptionStatuses.length)
        ],
      balance: parseFloat((Math.random() * 1000).toFixed(2)),
      lastTransactionDate,
    });
  }

  return users;
};

// Generate mock transactions
const generateMockTransactions = (users: User[]): Transaction[] => {
  const transactions: Transaction[] = [];
  const transactionTypes: Array<"Credit" | "Debit"> = ["Credit", "Debit"];

  users.forEach((user) => {
    const transactionCount = Math.floor(Math.random() * 5) + 1;

    for (let i = 1; i <= transactionCount; i++) {
      const date = format(
        subDays(new Date(), Math.floor(Math.random() * 30)),
        "yyyy-MM-dd"
      );
      const type =
        transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = parseFloat((Math.random() * 100).toFixed(2));

      transactions.push({
        id: `transaction-${user.id}-${i}`,
        userId: user.id,
        amount,
        type,
        date,
        description: `${
          type === "Credit" ? "Deposit" : "Withdrawal"
        } transaction`,
      });
    }
  });

  return transactions;
};

// Generate mock email templates
const generateMockEmailTemplates = (): EmailTemplate[] => {
  return [
    {
      id: "template-1",
      name: "Promotional Email",
      subject: "Promotions and Offers Inside!",
      content: `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Golden Ticket Online Arcade</title>
    <style>
        .main-body {
            font-family: Arial, sans-serif;
            background-color: #000;
            color: #fff;
            color:white;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            margin-bottom:0;
            background: #111;
            border-radius: 10px;
            overflow: hidden;
        }
        .header {
            background: #ffcc00;
            color: #000;
            text-align: center;
            padding: 20px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .button {
            display: inline-block;
            background: #ffcc00;
            color: #000;
            padding: 12px 20px;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
            margin-top: 15px;
        }
        .footer {
            background: #222;
            text-align: center;
            padding: 15px;
            font-size: 12px;
        }
        .unsubscribe {
            color: #ff5555;
            text-decoration: none;
        }
    </style>
</head>
<body class="main-body">
    <div class="container">
        <div class="header">
            <h1>🎰 Welcome to Golden Ticket Online Arcade! 🎰</h1>
        </div>
        <div class="content" >
            <p style="color:white;">Get ready to experience the ultimate adventure! Enjoy exclusive games, special promotions, and a chance to win big!</p>
            <p style="color:white;">Join now and claim your **FREE BONUS** to start playing!</p>
            <a target="_blank" href="https://gtoarcade.com" class="button">Claim Your Bonus</a>
        </div>
        <div class="footer">
            <p style="color:white;">Golden Ticket Online Arcade | All Rights Reserved</p>
        </div>
    </div>
</body>
</html>
      `,
      createdAt: format(subDays(new Date(), 20), "yyyy-MM-dd"),
      updatedAt: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    },
  ];
};

// Generate dashboard stats
const generateDashboardStats = (users: User[]): DashboardStats => {
  const subscribedUsers = users.filter(
    (user) => user.subscriptionStatus === "Active"
  ).length;

  return {
    totalUsers: users.length,
    subscribedUsers,
    totalGames: Math.floor(Math.random() * 100) + 50,
  };
};

// Generate registration trend data
const generateRegistrationTrend = (): RegistrationTrend[] => {
  const trend: RegistrationTrend[] = [];

  for (let i = 30; i >= 0; i--) {
    trend.push({
      date: format(subDays(new Date(), i), "MMM dd"),
      count: Math.floor(Math.random() * 10) + 1,
    });
  }

  return trend;
};

// Generate engagement metrics
const generateEngagementMetrics = (): EngagementMetric[] => {
  return [
    { name: "Daily Active Users", value: Math.floor(Math.random() * 100) + 50 },
    {
      name: "Average Session Time",
      value: Math.floor(Math.random() * 30) + 10,
    },
    { name: "Conversion Rate", value: Math.floor(Math.random() * 20) + 5 },
    { name: "Retention Rate", value: Math.floor(Math.random() * 30) + 60 },
  ];
};

// Generate all mock data
const users = generateMockUsers(50);
const transactions = generateMockTransactions(users);
const emailTemplates = generateMockEmailTemplates();
const dashboardStats = generateDashboardStats(users);
const registrationTrend = generateRegistrationTrend();
const engagementMetrics = generateEngagementMetrics();

export {
  users,
  transactions,
  emailTemplates,
  dashboardStats,
  registrationTrend,
  engagementMetrics,
};
