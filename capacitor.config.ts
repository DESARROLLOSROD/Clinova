import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clinova.app',
  appName: 'Clinova',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // DESARROLLO: Descomenta la siguiente línea y pon la IP de tu PC para probar en el móvil
    // url: 'http://192.168.1.18:3000',
    // url: 'http://192.168.67.111:3000',
    // cleartext: true,

    // PRODUCCIÓN: Descomenta y pon tu URL de Railway/Vercel
    url: 'https://clinova-production-561d.up.railway.app',
  }
};

export default config;
