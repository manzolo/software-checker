<template>
  <div>
    <!-- Actions bar -->
    <div class="flex items-center justify-between mb-6">
      <p class="text-sm text-gray-500">{{ store.list.length }} software tracciati</p>
      <div class="flex gap-2">
        <button @click="acknowledgeAll"
          :disabled="!hasPending"
          class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          ✓ Conferma tutti
        </button>
        <button @click="checkAll" :disabled="checking"
          class="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {{ checking ? 'Controllo...' : '↻ Controlla tutti' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-16 text-gray-400">Caricamento...</div>

    <!-- Empty state -->
    <div v-else-if="store.list.length === 0" class="text-center py-16">
      <p class="text-gray-400 mb-4">Nessun software tracciato</p>
      <RouterLink to="/software/new" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        Aggiungi il primo
      </RouterLink>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th class="px-4 py-3 text-left">Nome</th>
            <th class="px-4 py-3 text-left">Tipo</th>
            <th class="px-4 py-3 text-left">Ultima nota</th>
            <th class="px-4 py-3 text-left">Trovata</th>
            <th class="px-4 py-3 text-left">Controllato</th>
            <th class="px-4 py-3 text-left">Stato</th>
            <th class="px-4 py-3 text-right">Azioni</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in store.list" :key="s.id"
            :class="isNew(s) ? 'bg-yellow-50' : ''">
            <td class="px-4 py-3 font-medium text-gray-800">
              <a :href="s.url" target="_blank" class="hover:underline">{{ s.name }}</a>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded text-xs font-medium"
                :class="{
                  'bg-purple-100 text-purple-700': s.type === 'github',
                  'bg-blue-100 text-blue-700': s.type === 'rss',
                  'bg-orange-100 text-orange-700': s.type === 'scrape',
                }">
                {{ s.type }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ s.last_version || '—' }}</td>
            <td class="px-4 py-3">
              <span v-if="s.latest_found" :class="isNew(s) ? 'text-green-700 font-semibold' : 'text-gray-600'">
                {{ s.latest_found }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs">
              {{ s.last_checked_at ? formatDate(s.last_checked_at) : 'mai' }}
            </td>
            <td class="px-4 py-3">
              <span v-if="!s.is_active" class="text-xs text-gray-400">inattivo</span>
              <span v-else-if="isNew(s)"
                class="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                🆕 Nuova versione
              </span>
              <span v-else class="text-xs text-gray-400">aggiornato</span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button v-if="isNew(s)" @click="acknowledge(s.id)"
                  class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                  ✓ Conferma
                </button>
                <button @click="checkOne(s.id)"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  ↻
                </button>
                <RouterLink :to="`/software/${s.id}`"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  ✏️
                </RouterLink>
                <button @click="remove(s.id)"
                  class="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100">
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

const store = useSoftwareStore()
const checking = ref(false)

onMounted(() => store.fetchAll())

const hasPending = computed(() => store.list.some(s => isNew(s)))

function isNew(s) {
  return s.latest_found && s.latest_found !== s.last_version
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
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
  if (confirm('Eliminare questo software?')) await store.remove(id)
}
</script>
