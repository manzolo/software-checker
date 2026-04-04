import { onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications.js'

export function useSSE() {
  const notificationsStore = useNotificationsStore()
  let es = null

  function connect() {
    es = new EventSource('/api/notifications/stream')

    es.addEventListener('notification', (e) => {
      const { notification } = JSON.parse(e.data)
      notificationsStore.pushNotification(notification)
    })

    es.addEventListener('count', (e) => {
      const { unread } = JSON.parse(e.data)
      notificationsStore.setUnread(unread)
    })

    es.onerror = () => {
      // EventSource reconnects automatically after error
    }
  }

  onMounted(connect)
  onUnmounted(() => es?.close())
}
