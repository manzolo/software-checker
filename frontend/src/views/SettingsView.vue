<template>
  <div class="max-w-xl space-y-6">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ i18n.t('settings.title') }}</h2>

    <!-- Telegram -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="font-medium mb-4 text-gray-800 dark:text-gray-100">{{ i18n.t('settings.telegram') }}</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">{{ i18n.t('settings.botToken') }}</label>
          <input v-model="form.telegram_bot_token" type="password" placeholder="123456:ABC-DEF..."
            class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">{{ i18n.t('settings.chatId') }}</label>
          <input v-model="form.telegram_chat_id" type="text" placeholder="-100123456789"
            class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input v-model="form.notify_telegram" type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-indigo-600" />
          {{ i18n.t('settings.enableTelegram') }}
        </label>
        <button @click="testTelegram" :disabled="testing.telegram"
          class="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
          {{ testing.telegram ? i18n.t('settings.sending') : i18n.t('settings.testTelegram') }}
        </button>
        <p v-if="feedback.telegram" class="text-xs" :class="feedback.telegram.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
          {{ feedback.telegram.message }}
        </p>
      </div>
    </section>

    <!-- Web Push -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="font-medium mb-4 text-gray-800 dark:text-gray-100">{{ i18n.t('settings.webpush') }}</h3>
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input v-model="form.notify_webpush" type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-indigo-600" />
          {{ i18n.t('settings.enableWebpush') }}
        </label>
        <div v-if="webpush.supported.value">
          <button v-if="!webpush.subscribed.value" @click="webpush.subscribe()"
            class="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            {{ i18n.t('settings.subscribe') }}
          </button>
          <div v-else class="flex items-center gap-3">
            <span class="text-sm text-green-600 dark:text-green-400">{{ i18n.t('settings.subscribed') }}</span>
            <button @click="webpush.unsubscribe()"
              class="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              {{ i18n.t('settings.unsubscribe') }}
            </button>
          </div>
          <p v-if="webpush.error.value" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ webpush.error.value }}</p>
        </div>
        <p v-else class="text-xs text-gray-400 dark:text-gray-500">{{ i18n.t('settings.webpushUnsupported') }}</p>
        <button @click="testWebpush" :disabled="testing.webpush"
          class="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
          {{ testing.webpush ? i18n.t('settings.sending') : i18n.t('settings.testWebpush') }}
        </button>
        <p v-if="feedback.webpush" class="text-xs" :class="feedback.webpush.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
          {{ feedback.webpush.message }}
        </p>
      </div>
    </section>

    <!-- In-app -->
    <section class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="font-medium mb-3 text-gray-800 dark:text-gray-100">{{ i18n.t('settings.inapp') }}</h3>
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input v-model="form.notify_inapp" type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-indigo-600" />
        {{ i18n.t('settings.enableInapp') }}
      </label>
    </section>

    <button @click="save" :disabled="saving"
      class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
      {{ saving ? i18n.t('settings.saving') : i18n.t('settings.save') }}
    </button>
    <p v-if="saved" class="text-sm text-green-600 dark:text-green-400">{{ i18n.t('settings.saved') }}</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings.js'
import { useI18nStore } from '@/stores/i18n.js'
import { useWebPush } from '@/composables/useWebPush.js'

const settingsStore = useSettingsStore()
const i18n = useI18nStore()
const webpush = useWebPush()

const form = reactive({
  telegram_bot_token: '',
  telegram_chat_id: '',
  notify_telegram: false,
  notify_webpush: false,
  notify_inapp: true,
})

const saving = ref(false)
const saved = ref(false)
const testing = reactive({ telegram: false, webpush: false })
const feedback = reactive({ telegram: null, webpush: null })

onMounted(async () => {
  await settingsStore.fetch()
  const d = settingsStore.data
  form.telegram_bot_token = d.telegram_bot_token && d.telegram_bot_token !== '***' ? d.telegram_bot_token : ''
  form.telegram_chat_id = d.telegram_chat_id || ''
  form.notify_telegram = d.notify_telegram === 'true'
  form.notify_webpush = d.notify_webpush === 'true'
  form.notify_inapp = d.notify_inapp !== 'false'
  await webpush.checkStatus()
})

async function save() {
  saving.value = true
  saved.value = false
  try {
    await settingsStore.save({
      telegram_bot_token: form.telegram_bot_token,
      telegram_chat_id: form.telegram_chat_id,
      notify_telegram: String(form.notify_telegram),
      notify_webpush: String(form.notify_webpush),
      notify_inapp: String(form.notify_inapp),
    })
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } finally {
    saving.value = false
  }
}

async function testTelegram() {
  testing.telegram = true
  feedback.telegram = null
  try {
    await settingsStore.testTelegram()
    feedback.telegram = { ok: true, message: i18n.t('settings.telegramOk') }
  } catch (err) {
    feedback.telegram = { ok: false, message: err.response?.data?.error || err.message }
  } finally {
    testing.telegram = false
  }
}

async function testWebpush() {
  testing.webpush = true
  feedback.webpush = null
  try {
    await settingsStore.testWebpush()
    feedback.webpush = { ok: true, message: i18n.t('settings.webpushOk') }
  } catch (err) {
    feedback.webpush = { ok: false, message: err.response?.data?.error || err.message }
  } finally {
    testing.webpush = false
  }
}
</script>
