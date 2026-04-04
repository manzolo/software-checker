import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import it from '@/locales/it.js'
import en from '@/locales/en.js'

const locales = { it, en }

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref(localStorage.getItem('locale') || 'it')

  const messages = computed(() => locales[locale.value] || locales.it)

  function setLocale(lang) {
    locale.value = lang
    localStorage.setItem('locale', lang)
  }

  function t(key) {
    const keys = key.split('.')
    let val = messages.value
    for (const k of keys) val = val?.[k]
    return val ?? key
  }

  function dateLocale() {
    return locale.value === 'it' ? 'it-IT' : 'en-GB'
  }

  return { locale, setLocale, t, dateLocale }
})
