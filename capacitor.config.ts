import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://youndceo11.vercel.app";

const config: CapacitorConfig = {
  appId: "com.youngceo.app",
  appName: "Young CEO",
  webDir: "www",
  server: {
    url: serverUrl,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#581c87",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#581c87",
    },
  },
};

export default config;
