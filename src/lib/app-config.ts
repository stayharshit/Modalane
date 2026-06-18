export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
};

export default appConfig;
