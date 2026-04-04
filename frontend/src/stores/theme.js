import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 'system' | 'light' | 'dark'
  const preference = ref(localStorage.getItem('theme') || 'system')

  function apply() {
    const isDark =
      preference.value === 'dark' ||
      (preference.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  function setTheme(pref) {
    preference.value = pref
    localStorage.setItem('theme', pref)
    apply()
  }

  function cycle() {
    const order = ['system', 'light', 'dark']
    const next = order[(order.indexOf(preference.value) + 1) % order.length]
    setTheme(next)
  }

  function icon() {
    if (preference.value === 'dark') return '🌙'
    if (preference.value === 'light') return '☀️'
    return '💻'
  }

  return { preference, apply, setTheme, cycle, icon }
})
