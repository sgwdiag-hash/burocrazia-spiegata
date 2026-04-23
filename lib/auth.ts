import { betterAuth } from "better-auth";
import { createClient } from "@supabase/supabase-js";

export const auth = betterAuth({
  database: {
    type: "postgres",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        defaultValue: "free",
      },
      creditsRemaining: {
        type: "number",
        defaultValue: 3,
      },
    },
  },
  trustedOrigins: [
    "https://app.burocraziaspiegata.it",
    "https://capisci.it",
    "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;