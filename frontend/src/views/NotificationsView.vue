<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <p class="text-sm text-gray-500">{{ store.list.length }} notifiche</p>
      <button v-if="store.unread > 0" @click="store.markAllRead()"
        class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
        ✓ Segna tutte lette
      </button>
    </div>

    <div v-if="store.list.length === 0" class="text-center py-16 text-gray-400">
      Nessuna notifica
    </div>

    <div v-else class="space-y-2">
      <div v-for="n in store.list" :key="n.id"
        class="bg-white rounded-xl border px-4 py-3 flex items-start gap-3 transition-colors"
        :class="n.is_read ? 'border-gray-100' : 'border-indigo-200 bg-indigo-50'">
        <span class="text-xl mt-0.5">🔔</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800">{{ n.message }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(n.created_at) }}</p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button v-if="!n.is_read" @click="store.markRead(n.id)"
            class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">
            Letta
          </button>
          <button @click="store.remove(n.id)"
            class="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100">
            🗑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications.js'

const store = useNotificationsStore()
onMounted(() => store.fetchAll())

function formatDate(iso) {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
}
</script>
