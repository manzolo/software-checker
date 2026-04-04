import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '@/api/client.js'

export const useSettingsStore = defineStore('settings', () => {
  const data = ref({})

  async function fetch() {
    const res = await client.get('/settings')
    data.value = res.data
  }

  async function save(pairs) {
    await client.put('/settings', pairs)
    Object.assign(data.value, pairs)
  }

  async function testTelegram() {
    return client.post('/settings/test-telegram')
  }

  async function testWebpush() {
    return client.post('/settings/test-webpush')
  }

  return { data, fetch, save, testTelegram, testWebpush }
})
