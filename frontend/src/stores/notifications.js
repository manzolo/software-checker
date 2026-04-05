import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '@/api/client.js'

export const useNotificationsStore = defineStore('notifications', () => {
  const list = ref([])
  const unread = ref(0)

  async function fetchAll(params = {}) {
    const { data } = await client.get('/notifications', { params })
    list.value = data
  }

  async function fetchCount() {
    const { data } = await client.get('/notifications/count')
    unread.value = data.unread
  }

  async function markRead(id) {
    await client.put(`/notifications/${id}/read`)
    const n = list.value.find(n => n.id === id)
    if (n) { n.is_read = true; unread.value = Math.max(0, unread.value - 1) }
  }

  async function markAllRead() {
    await client.put('/notifications/read-all')
    list.value.forEach(n => n.is_read = true)
    unread.value = 0
  }

  async function remove(id) {
    await client.delete(`/notifications/${id}`)
    const n = list.value.find(n => n.id === id)
    if (n && !n.is_read) unread.value = Math.max(0, unread.value - 1)
    list.value = list.value.filter(n => n.id !== id)
  }

  async function removeAll() {
    await client.delete('/notifications/all')
    list.value = []
    unread.value = 0
  }

  function pushNotification(notification) {
    list.value.unshift(notification)
    unread.value++
  }

  function setUnread(count) {
    unread.value = count
  }

  return { list, unread, fetchAll, fetchCount, markRead, markAllRead, remove, removeAll, pushNotification, setUnread }
})
