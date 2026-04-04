<template>
  <div class="max-w-xl">
    <h2 class="text-lg font-semibold mb-6">{{ isEdit ? 'Modifica Software' : 'Aggiungi Software' }}</h2>
    <form @submit.prevent="submit" class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input v-model="form.name" type="text" required placeholder="es. Node.js"
          class="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">URL *</label>
        <input v-model="form.url" type="url" required placeholder="https://github.com/nodejs/node"
          class="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
        <select v-model="form.type" required
          class="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500">
          <option value="github">GitHub release</option>
          <option value="rss">RSS / Atom feed</option>
          <option value="scrape">Scraping HTML</option>
        </select>
      </div>
      <div v-if="form.type === 'scrape'">
        <label class="block text-sm font-medium text-gray-700 mb-1">CSS Selector *</label>
        <input v-model="form.css_selector" type="text" placeholder=".version-tag"
          class="w-full rounded-lg border-gray-300 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500" />
        <p class="text-xs text-gray-400 mt-1">Elemento HTML che contiene il numero di versione</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Frequenza controllo</label>
        <select v-model="form.check_interval"
          class="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500">
          <option value="hourly">Ogni ora</option>
          <option value="daily">Ogni giorno (ore 8)</option>
          <option value="weekly">Ogni settimana (lunedì ore 8)</option>
        </select>
      </div>
      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Versione nota
          <span class="text-xs font-normal text-gray-400 ml-1">(ultima confermata)</span>
        </label>
        <div class="flex gap-2">
          <input v-model="form.last_version" type="text" placeholder="es. v25.9.0"
            class="flex-1 rounded-lg border-gray-300 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500" />
          <button type="button" @click="form.last_version = ''"
            class="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"
            title="Azzera (torna a 'non verificato')">
            Reset
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-1">
          Modifica per testare o correggere manualmente. Lascia vuoto per azzerare.
          Ultima trovata dal checker: <span class="font-mono">{{ form.latest_found || '—' }}</span>
        </p>
      </div>
      <div v-if="isEdit">
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="form.is_active" type="checkbox" class="rounded border-gray-300 text-indigo-600" />
          Attivo
        </label>
      </div>
      <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</div>
      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="saving"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-colors">
          {{ saving ? 'Salvataggio...' : 'Salva' }}
        </button>
        <RouterLink to="/" class="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
          Annulla
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSoftwareStore } from '@/stores/software.js'

const route = useRoute()
const router = useRouter()
const store = useSoftwareStore()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const error = ref(null)

const form = ref({
  name: '',
  url: '',
  type: 'github',
  check_interval: 'daily',
  css_selector: '',
  last_version: '',
  latest_found: '',
  is_active: true,
})

onMounted(async () => {
  if (isEdit.value) {
    const existing = store.list.find(s => s.id === Number(route.params.id))
    if (existing) Object.assign(form.value, existing)
  }
})

async function submit() {
  saving.value = true
  error.value = null
  try {
    const payload = { ...form.value }
    if (payload.type !== 'scrape') delete payload.css_selector
    delete payload.latest_found  // campo read-only, non inviare al backend
    if (isEdit.value) {
      await store.update(Number(route.params.id), payload)
    } else {
      await store.create(payload)
    }
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.errors?.join(', ') || err.message
  } finally {
    saving.value = false
  }
}
</script>
