<template>
  <nav class="w-56 bg-gray-900 dark:bg-gray-950 text-gray-100 flex flex-col min-h-screen shrink-0">
    <div class="px-5 py-5 border-b border-gray-700">
      <span class="text-lg font-bold tracking-tight">Software Checker</span>
    </div>
    <ul class="flex-1 py-4 space-y-1 px-3">
      <li v-for="item in navItems" :key="item.to">
        <RouterLink
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="$route.path === item.to
            ? 'bg-indigo-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
        >
          <span class="text-base">{{ item.icon }}</span>
          {{ item.label }}
          <span v-if="item.badge && unread > 0"
            class="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {{ unread }}
          </span>
        </RouterLink>
      </li>
    </ul>
    <div class="px-5 py-3 border-t border-gray-700">
      <span class="text-xs text-gray-500 font-mono">v{{ version }}</span>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications.js'
import { useI18nStore } from '@/stores/i18n.js'
import client from '@/api/client.js'

const { unread } = useNotificationsStore()
const i18n = useI18nStore()
const version = ref('…')

onMounted(async () => {
  try {
    const { data } = await client.get('/health')
    version.value = data.version || '?'
  } catch {
    version.value = '?'
  }
})

const navItems = computed(() => [
  { to: '/',              icon: '📦', label: i18n.t('nav.dashboard') },
  { to: '/notifications', icon: '🔔', label: i18n.t('nav.notifications'), badge: true },
  { to: '/settings',      icon: '⚙️',  label: i18n.t('nav.settings') },
])
</script>
