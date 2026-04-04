<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
    <h1 class="text-base font-semibold text-gray-700 dark:text-gray-200">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <!-- Theme toggle -->
      <button @click="themeStore.cycle()" :title="themeLabel"
        class="text-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
        {{ themeStore.icon() }}
      </button>

      <!-- Language toggle -->
      <div class="flex items-center gap-0.5 text-xs font-medium">
        <button @click="i18n.setLocale('it')"
          :class="i18n.locale.value === 'it'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'"
          class="px-1.5 py-0.5 rounded transition-colors">
          IT
        </button>
        <button @click="i18n.setLocale('en')"
          :class="i18n.locale.value === 'en'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'"
          class="px-1.5 py-0.5 rounded transition-colors">
          EN
        </button>
      </div>

      <RouterLink to="/notifications" class="relative text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100">
        <span class="text-xl">🔔</span>
        <span v-if="unread > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {{ unread > 9 ? '9+' : unread }}
        </span>
      </RouterLink>
      <RouterLink to="/software/new"
        class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
        {{ i18n.t('navbar.add') }}
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications.js'
import { useThemeStore } from '@/stores/theme.js'
import { useI18nStore } from '@/stores/i18n.js'
import { storeToRefs } from 'pinia'

const route = useRoute()
const notificationsStore = useNotificationsStore()
const themeStore = useThemeStore()
const i18n = useI18nStore()
const { unread } = storeToRefs(notificationsStore)

const title = computed(() => {
  const titles = i18n.t('navbar.titles')
  return titles[route.path] ?? titles.edit
})

const themeLabel = computed(() => {
  const map = { system: i18n.t('settings.themeSystem'), light: i18n.t('settings.themeLight'), dark: i18n.t('settings.themeDark') }
  return map[themeStore.preference] ?? ''
})
</script>
