import { ref } from 'vue'
import client from '@/api/client.js'

export function useWebPush() {
  const supported = ref('serviceWorker' in navigator && 'PushManager' in window)
  const subscribed = ref(false)
  const error = ref(null)

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
  }

  async function subscribe() {
    if (!supported.value) return
    try {
      const { data } = await client.get('/push/vapid-public-key')
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      })

      await client.post('/push/subscribe', subscription.toJSON())
      subscribed.value = true
    } catch (err) {
      error.value = err.message
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await client.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } })
        await sub.unsubscribe()
      }
      subscribed.value = false
    } catch (err) {
      error.value = err.message
    }
  }

  async function checkStatus() {
    if (!supported.value) return
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager?.getSubscription()
    subscribed.value = !!sub
  }

  return { supported, subscribed, error, subscribe, unsubscribe, checkStatus }
}
