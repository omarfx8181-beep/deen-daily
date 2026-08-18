import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.deendaily',
  appName: 'Deen Daily',
  webDir: 'dist',
  backgroundColor: '#0C1220',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#C9A227',
    },
  },
}

export default config
