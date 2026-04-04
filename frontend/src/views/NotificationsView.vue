<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ i18n.t('notifications.count').replace('{n}', store.list.length) }}
      </p>
      <button v-if="store.unread > 0" @click="store.markAllRead()"
        class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
        {{ i18n.t('notifications.markAllRead') }}
      </button>
    </div>

    <div v-if="store.list.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
      {{ i18n.t('notifications.empty') }}
    </div>

    <div v-else class="space-y-2">
      <div v-for="n in store.list" :key="n.id"
        class="bg-white dark:bg-gray-800 rounded-xl border px-4 py-3 flex items-start gap-3 transition-colors"
        :class="n.is_read
          ? 'border-gray-100 dark:border-gray-700'
          : 'border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30'">
        <span class="text-xl mt-0.5">🔔</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ n.message }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ formatDate(n.created_at) }}</p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button v-if="!n.is_read" @click="store.markRead(n.id)"
            class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/70">
            {{ i18n.t('notifications.markRead') }}
          </button>
          <button @click="store.remove(n.id)"
            class="text-xs px-2 py-1 bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50">
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
import { useI18nStore } from '@/stores/i18n.js'

const store = useNotificationsStore()
const i18n = useI18nStore()
onMounted(() => store.fetchAll())

function formatDate(iso) {
  return new Date(iso).toLocaleString(i18n.dateLocale(), { dateStyle: 'short', timeStyle: 'short' })
}
</script>
