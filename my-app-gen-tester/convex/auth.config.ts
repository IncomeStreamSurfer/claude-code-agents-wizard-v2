import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk JWT issuer domain for authentication
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: "https://legible-mudfish-25.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
