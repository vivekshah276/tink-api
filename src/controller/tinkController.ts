import { Request, Response } from "express";
import config from "../config";
import { URLSearchParams } from "url";
import axios from "axios";
import nodemailer from "nodemailer";
import { Subscription } from "../models/subscription";
import { Op } from "sequelize";


const transporter = nodemailer.createTransport({
  host: config.email_host,
  port: config.email_port,
  auth: {
    user: config.email_auth_user,
    pass: config.email_auth_pass,
  },
});

const sendRenewalEmail = async (to: any, subscription: any) => {
  const mailOptions = {
    from: '"SubNotify" <no-reply@example.com>',
    to,
    subject: "Upcoming Subscription Renewal",
    text: `Hi, your subscription to ${subscription.description} for ${
      subscription.amount
    } ${subscription.currencyCode} renews on ${new Date(
      subscription.nextExpectedDate
    ).toDateString()}.`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Sent email:", info.messageId);
  console.log("🔗 Preview:", nodemailer.getTestMessageUrl(info));
};


export const checkUpcomingRenewals = async () => {
  const now = new Date();
  const in3Days = new Date();
  in3Days.setDate(now.getDate() + 3);

  try {
    const subscriptions = await Subscription.findAll({
      where: {
        nextExpectedDate: {
          [Op.between]: [now, in3Days], // Renewing within 3 days
        },
        lastNotified: {
          [Op.is]: null, // Only send if never notified
        },
      },
    });

    for (const subscription of subscriptions) {
      await sendRenewalEmail(subscription.email, subscription);
      subscription.lastNotified = now;
      await subscription.save(); // Mark as notified to prevent resending
    }

    return subscriptions.length;
  } catch (error) {
    console.error("Error while fetching subscriptions or sending emails:", error);
    throw error;
  }
};

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
// Account interface (updated)
interface Account {
  id: string;
  name: string;
  type: string;
  currencyCode: string;

  balances: {
    booked: {
      amount: {
        value: {
          unscaledValue: string;
          scale: string;
        };
        currencyCode: string;
      };
    };
    available?: {
      amount: {
        value: {
          unscaledValue: string;
          scale: string;
        };
        currencyCode: string;
      };
    };
  };

  identifiers?: {
    financialInstitution?: {
      accountNumber?: string;
      referenceNumbers?: Record<string, string>;
    };
  };

  dates?: {
    lastRefreshed?: string;
  };

  customerSegment?: string;

  [key: string]: any; // To capture any additional fields Tink might return
}

// Transaction interface (unchanged, unless your fields change)
interface Transaction {
  id: string;
  accountId: string;
  amount: {
    value: {
      unscaledValue: string;
      scale: string;
    };
    currencyCode: string;
  };
  date: string;
  description: string;
  categoryType?: string;
  merchantName?: string;
  status?: string;
  [key: string]: any;
}

// Response structures
interface AccountsResponse {
  accounts: Account[];
}

interface TransactionsResponse {
  transactions: Transaction[];
}

export const redirectToTink = async (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: config.TINK_CLIENT_ID,
    // client_secret: config.TINK_CLIENT_SECRET,
    redirect_uri: config.TINK_REDIRECT_URI,
    response_type: "code",
    scope: "accounts:read,transactions:read",
    market: "GB",
  });

  return res.redirect(
    `https://link.tink.com/1.0/authorize/?${params.toString()}`
  );
};

export const handleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (typeof code !== "string") {
    res.status(400).json({ error: "Invalid authorization code" });
    return;
  }

  const userId = 123;

  try {
    const response = await axios.post<TokenResponse>(
      "https://api.tink.com/api/v1/oauth/token",
      new URLSearchParams({
        code,
        client_id: config.TINK_CLIENT_ID,
        client_secret: config.TINK_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: config.TINK_REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    res
      .status(200)
      .json({ success: true, access_token, refresh_token, expires_in });
    return;
  } catch (error) {
    res.status(500).json({ message: "Token exchange failed" });
  }
};

//get the user detail
export const userData = async (req: Request, res: Response): Promise<void> => {
  const accessToken = req.body.accessToken;
  if (!accessToken) {
    res.status(401).json({ message: "Access token missing" });
    return;
  }

  try {
    // Fetch accounts
    const accountsResponse = await axios.get<AccountsResponse>(
      "https://api.tink.com/data/v2/accounts",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const accounts = accountsResponse.data.accounts;

    // Fetch transactions
    const transactionsResponse = await axios.get<TransactionsResponse>(
      "https://api.tink.com/data/v2/transactions",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const allTransactions = transactionsResponse.data.transactions;

    // Filter and format required account and transaction fields
    const filteredAccounts = accounts.map((account) => {
      const booked = account.balances?.booked?.amount?.value;
      const available = account.balances?.available?.amount?.value;

      const relatedTransactions = allTransactions
        .filter((tx) => tx.accountId === account.id)
        .map((tx) => ({
          id: tx.id,
          description: tx.description,
          date: tx.date,
          amount: `${tx.amount.value.unscaledValue} ${tx.amount.currencyCode}`,
        }));

      return {
        id: account.id,
        name: account.name,
        type: account.type,
        accountNumber: account.identifiers?.financialInstitution?.accountNumber,
        currencyCode: account.balances.booked.amount.currencyCode,
        bookedBalance: booked
          ? `${booked.unscaledValue} (scale: ${booked.scale})`
          : "N/A",
        availableBalance: available
          ? `${available.unscaledValue} (scale: ${available.scale})`
          : "N/A",
        lastRefreshed: account.dates?.lastRefreshed,
        customerSegment: account.customerSegment,
        transactions: relatedTransactions,
      };
    });

    res.status(200).json({
      message: "User data fetched successfully",
      accounts: filteredAccounts,
    });
  } catch (error) {
    console.error("errorrr", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};
