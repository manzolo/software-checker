<template>
  <div>
    <!-- Actions bar -->
    <div class="flex items-center justify-between mb-6">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ i18n.t('dashboard.tracked').replace('{n}', store.list.length) }}
      </p>
      <div class="flex gap-2">
        <button @click="acknowledgeAll"
          :disabled="!hasPending"
          class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
          {{ i18n.t('dashboard.confirmAll') }}
        </button>
        <button @click="checkAll" :disabled="checking"
          class="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {{ checking ? i18n.t('dashboard.checking') : i18n.t('dashboard.checkAll') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-16 text-gray-400 dark:text-gray-500">
      {{ i18n.t('dashboard.loading') }}
    </div>

    <!-- Empty state -->
    <div v-else-if="store.list.length === 0" class="text-center py-16">
      <p class="text-gray-400 dark:text-gray-500 mb-4">{{ i18n.t('dashboard.empty') }}</p>
      <RouterLink to="/software/new" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        {{ i18n.t('dashboard.addFirst') }}
      </RouterLink>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
          <tr>
            <th class="px-4 py-3 text-left">{{ i18n.t('dashboard.colName') }}</th>
            <th class="px-4 py-3 text-left">{{ i18n.t('dashboard.colType') }}</th>
            <th class="px-4 py-3 text-left">{{ i18n.t('dashboard.colLastKnown') }}</th>
            <th class="px-4 py-3 text-left">{{ i18n.t('dashboard.colFound') }}</th>
            <th class="px-4 py-3 text-left">{{ i18n.t('dashboard.colChecked') }}</th>
            <th class="px-4 py-3 text-left">{{ i18n.t('dashboard.colStatus') }}</th>
            <th class="px-4 py-3 text-right">{{ i18n.t('dashboard.colActions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-for="s in store.list" :key="s.id"
            :class="isNew(s) ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''">
            <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
              <a :href="s.url" target="_blank" class="hover:underline">{{ s.name }}</a>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded text-xs font-medium"
                :class="{
                  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300': s.type === 'github',
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': s.type === 'rss',
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300': s.type === 'scrape',
                }">
                {{ s.type }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ s.last_version || '—' }}</td>
            <td class="px-4 py-3">
              <span v-if="s.latest_found" :class="isNew(s) ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-300'">
                {{ s.latest_found }}
              </span>
              <span v-else class="text-gray-400 dark:text-gray-500">—</span>
            </td>
            <td class="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">
              {{ s.last_checked_at ? formatDate(s.last_checked_at) : i18n.t('dashboard.never') }}
            </td>
            <td class="px-4 py-3">
              <span v-if="!s.is_active" class="text-xs text-gray-400 dark:text-gray-500">
                {{ i18n.t('dashboard.inactive') }}
              </span>
              <span v-else-if="isNew(s)"
                class="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                {{ i18n.t('dashboard.newVersion') }}
              </span>
              <span v-else class="text-xs text-gray-400 dark:text-gray-500">
                {{ i18n.t('dashboard.upToDate') }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button v-if="isNew(s)" @click="acknowledge(s.id)"
                  class="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/60">
                  {{ i18n.t('dashboard.confirm') }}
                </button>
                <button @click="checkOne(s.id)"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                  ↻
                </button>
                <RouterLink :to="`/software/${s.id}`"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                  ✏️
                </RouterLink>
                <button @click="remove(s.id)"
                  class="text-xs px-2 py-1 bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50">
                  🗑
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSoftwareStore } from '@/stores/software.js'
import { useI18nStore } from '@/stores/i18n.js'

const store = useSoftwareStore()
const i18n = useI18nStore()
const checking = ref(false)

onMounted(() => store.fetchAll())

const hasPending = computed(() => store.list.some(s => isNew(s)))

function isNew(s) {
  return s.latest_found && s.latest_found !== s.last_version
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(i18n.dateLocale(), { dateStyle: 'short', timeStyle: 'short' })
}

async function checkOne(id) {
  await store.checkOne(id)
}

async function checkAll() {
  checking.value = true
  try { await store.checkAll() } finally { checking.value = false }
}

async function acknowledge(id) {
  await store.acknowledge(id)
}

async function acknowledgeAll() {
  await store.acknowledgeAll()
}

async function remove(id) {
  if (confirm(i18n.t('dashboard.deleteConfirm'))) await store.remove(id)
}
</script>
