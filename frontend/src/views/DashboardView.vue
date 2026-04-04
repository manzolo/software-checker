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
          <template v-for="s in store.list" :key="s.id">
            <!-- Main row -->
            <tr :class="isNew(s) ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''">
              <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                <div class="flex items-center gap-2">
                  <a :href="s.url" target="_blank" class="hover:underline">{{ s.name }}</a>
                  <button v-if="hasInstances(s)" @click="toggleExpand(s.id)"
                    class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 font-mono tabular-nums">
                    {{ expanded.has(s.id) ? '▲' : '▼' }} {{ s.instances.length }}
                  </button>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="{
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300': s.type === 'github',
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': s.type === 'rss',
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300': s.type === 'scrape',
                    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300': s.type === 'apt',
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
                <span v-else-if="s.last_check_error"
                  class="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-2 py-0.5 rounded-full font-medium cursor-help"
                  :title="s.last_check_error">
                  ⚠️ {{ i18n.t('dashboard.checkError') }}
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

            <!-- Instances sub-row -->
            <tr v-if="hasInstances(s) && expanded.has(s.id)">
              <td colspan="7" class="px-0 py-0">
                <div class="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="text-gray-400 dark:text-gray-500 uppercase">
                        <th class="pl-12 pr-4 py-2 text-left">{{ i18n.t('instances.colName') }}</th>
                        <th class="px-4 py-2 text-left">{{ i18n.t('instances.colDeployed') }}</th>
                        <th class="px-4 py-2 text-left">{{ i18n.t('instances.colStatus') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="inst in s.instances" :key="inst.id"
                        class="border-t border-gray-100 dark:border-gray-700/50">
                        <td class="pl-12 pr-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
                          └ {{ inst.name }}
                        </td>
                        <td class="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">
                          {{ inst.deployed_version || '—' }}
                        </td>
                        <td class="px-4 py-2">
                          <span v-if="!inst.deployed_version" class="text-gray-400 dark:text-gray-500">
                            {{ i18n.t('instances.unknown') }}
                          </span>
                          <span v-else-if="inst.deployed_version === s.latest_found"
                            class="text-green-600 dark:text-green-400">
                            ✓ {{ i18n.t('instances.upToDate') }}
                          </span>
                          <span v-else class="text-amber-600 dark:text-amber-400 font-medium">
                            ⚠ {{ i18n.t('instances.outdated') }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
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
const expanded = ref(new Set())

onMounted(() => store.fetchAll())

const hasPending = computed(() => store.list.some(s => isNew(s)))

function isNew(s) {
  return s.latest_found && s.latest_found !== s.last_version
}

function hasInstances(s) {
  return Array.isArray(s.instances) && s.instances.length > 0
}

function toggleExpand(id) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
  expanded.value = new Set(expanded.value)
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
