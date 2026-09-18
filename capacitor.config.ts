import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wizzing.game',
  appName: 'Wizzing',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#05070a'
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#05070a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    }
  }
};

export default config;
