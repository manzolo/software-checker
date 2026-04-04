<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <AppSidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <AppNavbar />
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import { useSSE } from '@/composables/useSSE.js'
import { useNotificationsStore } from '@/stores/notifications.js'
import { useThemeStore } from '@/stores/theme.js'
import { onMounted, onUnmounted } from 'vue'

useSSE()
const notificationsStore = useNotificationsStore()
const themeStore = useThemeStore()

let mq = null

onMounted(() => {
  notificationsStore.fetchCount()
  themeStore.apply()
  mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', themeStore.apply)
})

onUnmounted(() => {
  mq?.removeEventListener('change', themeStore.apply)
})
</script>
