// Helper service for Mobile System Notifications (Browser Notification API & Audio / Vibration)

export interface DeviceNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  data?: any;
}

export const SystemNotificationService = {
  // Check if Web Notifications are supported in current browser/device
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  // Get current permission state: 'granted', 'denied', or 'default'
  getPermissionState(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  // Request native permission from browser/system
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      alert('As notificações do sistema não são suportadas neste navegador/dispositivo.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Trigger vibration feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        return true;
      } else if (permission === 'denied') {
        return false;
      }
      return false;
    } catch (e) {
      console.error('Erro ao solicitar permissão de notificação:', e);
      return false;
    }
  },

  // Trigger sound effect and vibration
  playAlertEffects() {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
      // Simple web audio synth beep for notification alert
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (err) {
      console.warn('Audio alert not supported or blocked:', err);
    }
  },

  // Trigger system push/local notification on mobile or desktop
  sendNotification(options: DeviceNotificationOptions): boolean {
    this.playAlertEffects();

    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      // Try Service Worker notification if registered for PWA
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(options.title, {
            body: options.body,
            icon: '/icon.png',
            tag: options.tag || 'tattoo-agenda',
            badge: '/icon.png',
            vibrate: [200, 100, 200],
            data: options.data,
          } as any);
        }).catch(() => {
          this.fallbackNotification(options);
        });
      } else {
        this.fallbackNotification(options);
      }
      return true;
    } catch (err) {
      console.error('Erro ao enviar notificação do sistema:', err);
      return false;
    }
  },

  fallbackNotification(options: DeviceNotificationOptions) {
    try {
      const notif = new Notification(options.title, {
        body: options.body,
        icon: '/icon.png',
        tag: options.tag || 'tattoo-agenda',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('Notification constructor failed:', e);
    }
  }
};
