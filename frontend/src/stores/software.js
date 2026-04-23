import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '@/api/client.js'

export const useSoftwareStore = defineStore('software', () => {
  const list = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await client.get('/software')
      list.value = data
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const { data } = await client.post('/software', payload)
    list.value.push(data)
    return data
  }

  async function update(id, payload) {
    const { data } = await client.put(`/software/${id}`, payload)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx !== -1) list.value[idx] = { ...list.value[idx], ...data }
    return data
  }

  async function remove(id) {
    await client.delete(`/software/${id}`)
    list.value = list.value.filter(s => s.id !== id)
  }

  async function checkOne(id) {
    const { data } = await client.post(`/software/${id}/check`)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx !== -1) list.value[idx] = { ...list.value[idx], latest_found: data.version, last_checked_at: new Date().toISOString(), last_check_error: null }
    return data
  }

  async function checkAll() {
    const { data } = await client.post('/software/check-all')
    await fetchAll()
    return data
  }

  async function acknowledge(id) {
    const { data } = await client.post(`/software/${id}/acknowledge`)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx !== -1) list.value[idx] = { ...list.value[idx], ...data }
    return data
  }

  async function acknowledgeAll() {
    const { data } = await client.post('/software/acknowledge-all')
    await fetchAll()
    return data
  }

  async function createInstance(id, payload) {
    const { data } = await client.post(`/software/${id}/instances`, payload)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx !== -1) list.value[idx].instances = [...(list.value[idx].instances || []), data]
    return data
  }

  async function updateInstance(id, iid, payload) {
    const { data } = await client.put(`/software/${id}/instances/${iid}`, payload)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      const iIdx = list.value[idx].instances.findIndex(i => i.id === iid)
      if (iIdx !== -1) list.value[idx].instances[iIdx] = data
    }
    return data
  }

  async function removeInstance(id, iid) {
    await client.delete(`/software/${id}/instances/${iid}`)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx !== -1) list.value[idx].instances = list.value[idx].instances.filter(i => i.id !== iid)
  }

  async function toggleActive(id) {
    const idx = list.value.findIndex(s => s.id === id)
    if (idx === -1) return
    const { data } = await client.put(`/software/${id}`, { is_active: !list.value[idx].is_active })
    list.value[idx] = { ...list.value[idx], ...data }
    return data
  }

  return { list, loading, fetchAll, create, update, remove, checkOne, checkAll, acknowledge, acknowledgeAll, createInstance, updateInstance, removeInstance, toggleActive }
})
