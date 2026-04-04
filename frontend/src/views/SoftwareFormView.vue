<template>
  <div class="max-w-xl">
    <h2 class="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-100">
      {{ isEdit ? i18n.t('form.editTitle') : i18n.t('form.addTitle') }}
    </h2>
    <form @submit.prevent="submit" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ i18n.t('form.name') }}</label>
        <input v-model="form.name" type="text" required :placeholder="i18n.t('form.namePlaceholder')"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ i18n.t('form.url') }}</label>
        <input v-model="form.url" type="url" required :placeholder="i18n.t('form.urlPlaceholder')"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ i18n.t('form.type') }}</label>
        <select v-model="form.type" required
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500">
          <option value="github">{{ i18n.t('form.typeGithub') }}</option>
          <option value="rss">{{ i18n.t('form.typeRss') }}</option>
          <option value="scrape">{{ i18n.t('form.typeScrape') }}</option>
          <option value="apt">{{ i18n.t('form.typeApt') }}</option>
        </select>
      </div>
      <div v-if="form.type === 'scrape'">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ i18n.t('form.cssSelector') }}</label>
        <input v-model="form.css_selector" type="text" :placeholder="i18n.t('form.selectorPlaceholder')"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500" />
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ i18n.t('form.cssSelectorHint') }}</p>
      </div>
      <div v-if="form.type === 'apt'">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ i18n.t('form.aptPackage') }}</label>
        <input v-model="form.css_selector" type="text" :placeholder="i18n.t('form.aptPackagePlaceholder')"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500" />
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ i18n.t('form.aptPackageHint') }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ i18n.t('form.interval') }}</label>
        <select v-model="form.check_interval"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500">
          <option value="hourly">{{ i18n.t('form.intervalHourly') }}</option>
          <option value="daily">{{ i18n.t('form.intervalDaily') }}</option>
          <option value="weekly">{{ i18n.t('form.intervalWeekly') }}</option>
        </select>
      </div>
      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ i18n.t('form.lastVersion') }}
          <span class="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">({{ i18n.t('form.lastVersionHint') }})</span>
        </label>
        <div class="flex gap-2">
          <input v-model="form.last_version" type="text" :placeholder="i18n.t('form.versionPlaceholder')"
            class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500" />
          <button type="button" @click="form.last_version = ''"
            class="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            :title="i18n.t('form.reset')">
            {{ i18n.t('form.reset') }}
          </button>
        </div>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {{ i18n.t('form.lastVersionDesc') }}
          {{ i18n.t('form.lastFoundLabel') }} <span class="font-mono">{{ form.latest_found || '—' }}</span>
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ i18n.t('form.notifyChannels') }}</label>
        <div class="space-y-1.5">
          <label class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <input type="checkbox" checked disabled class="rounded border-gray-300 text-indigo-600" />
            {{ i18n.t('form.notifyInapp') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input v-model="form.notifyTelegram" type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-indigo-600" />
            {{ i18n.t('form.notifyTelegram') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input v-model="form.notifyWebpush" type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-indigo-600" />
            {{ i18n.t('form.notifyWebpush') }}
          </label>
        </div>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ i18n.t('form.notifyChannelsHint') }}</p>
      </div>
      <div v-if="isEdit">
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input v-model="form.is_active" type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-indigo-600" />
          {{ i18n.t('form.active') }}
        </label>
      </div>

      <!-- Instances -->
      <div v-if="isEdit" class="pt-2 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ i18n.t('instances.title') }}</label>
          <button type="button" @click="showAddInstance = !showAddInstance"
            class="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
            + {{ i18n.t('instances.add') }}
          </button>
        </div>

        <!-- Add instance form -->
        <div v-if="showAddInstance" class="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 space-y-2">
          <input v-model="newInstance.name" type="text" :placeholder="i18n.t('instances.namePlaceholder')"
            class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
          <div class="flex gap-2">
            <input v-model="newInstance.deployed_version" type="text" :placeholder="i18n.t('instances.versionPlaceholder')"
              class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500" />
            <button v-if="form.latest_found" type="button" @click="newInstance.deployed_version = form.latest_found"
              :title="form.latest_found"
              class="text-xs px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-mono whitespace-nowrap">
              ↑ {{ form.latest_found }}
            </button>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="addInstance" :disabled="!newInstance.name.trim()"
              class="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {{ i18n.t('instances.save') }}
            </button>
            <button type="button" @click="showAddInstance = false; newInstance = { name: '', deployed_version: '' }"
              class="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              {{ i18n.t('instances.cancel') }}
            </button>
          </div>
        </div>

        <!-- Instance list -->
        <div v-if="instances.length === 0 && !showAddInstance" class="text-xs text-gray-400 dark:text-gray-500 py-1">
          {{ i18n.t('instances.noInstances') }}
        </div>
        <div v-else class="space-y-1">
          <div v-for="inst in instances" :key="inst.id"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
            <template v-if="editingInstance?.id === inst.id">
              <input v-model="editingInstance.name" type="text"
                class="flex-1 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-xs focus:ring-indigo-500 focus:border-indigo-500 py-1" />
              <input v-model="editingInstance.deployed_version" type="text"
                class="w-28 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-xs font-mono focus:ring-indigo-500 focus:border-indigo-500 py-1" />
              <button v-if="form.latest_found" type="button"
                @click="editingInstance.deployed_version = form.latest_found"
                :title="form.latest_found"
                class="text-xs px-1.5 py-1 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600 font-mono">
                ↑
              </button>
              <button type="button" @click="saveInstance"
                class="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                ✓
              </button>
              <button type="button" @click="editingInstance = null"
                class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                ✕
              </button>
            </template>
            <template v-else>
              <span class="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">{{ inst.name }}</span>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ inst.deployed_version || '—' }}</span>
              <button type="button" @click="editingInstance = { ...inst }"
                class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500">
                ✏️
              </button>
              <button type="button" @click="deleteInstance(inst.id)"
                class="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50">
                🗑
              </button>
            </template>
          </div>
        </div>
      </div>
      <div v-if="error" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">{{ error }}</div>
      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="saving"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-colors">
          {{ saving ? i18n.t('form.saving') : i18n.t('form.save') }}
        </button>
        <RouterLink to="/" class="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          {{ i18n.t('form.cancel') }}
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSoftwareStore } from '@/stores/software.js'
import { useI18nStore } from '@/stores/i18n.js'

const route = useRoute()
const router = useRouter()
const store = useSoftwareStore()
const i18n = useI18nStore()

const isEdit = computed(() => !!route.params.id)
const softwareId = computed(() => Number(route.params.id))
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
  notifyTelegram: false,
  notifyWebpush: false,
})

// Instances state
const instances = ref([])
const showAddInstance = ref(false)
const newInstance = ref({ name: '', deployed_version: '' })
const editingInstance = ref(null)

onMounted(async () => {
  if (isEdit.value) {
    const existing = store.list.find(s => s.id === softwareId.value)
    if (existing) {
      Object.assign(form.value, existing)
      const channels = (existing.notify_channels || 'inapp').split(',').map(s => s.trim())
      form.value.notifyTelegram = channels.includes('telegram')
      form.value.notifyWebpush = channels.includes('webpush')
      instances.value = [...(existing.instances || [])]
    }
  }
})

async function addInstance() {
  if (!newInstance.value.name.trim()) return
  const inst = await store.createInstance(softwareId.value, {
    name: newInstance.value.name.trim(),
    deployed_version: newInstance.value.deployed_version || null,
  })
  instances.value.push(inst)
  newInstance.value = { name: '', deployed_version: '' }
  showAddInstance.value = false
}

async function saveInstance() {
  if (!editingInstance.value) return
  const updated = await store.updateInstance(softwareId.value, editingInstance.value.id, {
    name: editingInstance.value.name,
    deployed_version: editingInstance.value.deployed_version || null,
  })
  const idx = instances.value.findIndex(i => i.id === updated.id)
  if (idx !== -1) instances.value[idx] = updated
  editingInstance.value = null
}

async function deleteInstance(iid) {
  if (!confirm(i18n.t('instances.deleteConfirm'))) return
  await store.removeInstance(softwareId.value, iid)
  instances.value = instances.value.filter(i => i.id !== iid)
}

async function submit() {
  saving.value = true
  error.value = null
  try {
    const payload = { ...form.value }
    if (payload.type !== 'scrape') delete payload.css_selector
    delete payload.latest_found
    const channels = ['inapp']
    if (payload.notifyTelegram) channels.push('telegram')
    if (payload.notifyWebpush) channels.push('webpush')
    payload.notify_channels = channels.join(',')
    delete payload.notifyTelegram
    delete payload.notifyWebpush
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
