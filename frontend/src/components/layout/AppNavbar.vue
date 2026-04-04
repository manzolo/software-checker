<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <h1 class="text-base font-semibold text-gray-700">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <RouterLink to="/notifications" class="relative text-gray-500 hover:text-gray-800">
        <span class="text-xl">🔔</span>
        <span v-if="unread > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {{ unread > 9 ? '9+' : unread }}
        </span>
      </RouterLink>
      <RouterLink to="/software/new"
        class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
        + Aggiungi
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications.js'
import { storeToRefs } from 'pinia'

const route = useRoute()
const notificationsStore = useNotificationsStore()
const { unread } = storeToRefs(notificationsStore)

const titles = {
  '/': 'Dashboard',
  '/notifications': 'Notifiche',
  '/settings': 'Impostazioni',
  '/software/new': 'Aggiungi Software',
}
const title = computed(() => titles[route.path] || 'Modifica Software')
</script>
