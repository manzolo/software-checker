import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',               component: () => import('@/views/DashboardView.vue'), name: 'dashboard' },
    { path: '/software/new',   component: () => import('@/views/SoftwareFormView.vue'), name: 'software-new' },
    { path: '/software/:id',   component: () => import('@/views/SoftwareFormView.vue'), name: 'software-edit' },
    { path: '/notifications',  component: () => import('@/views/NotificationsView.vue'), name: 'notifications' },
    { path: '/settings',       component: () => import('@/views/SettingsView.vue'), name: 'settings' },
    { path: '/docker',         component: () => import('@/views/DockerView.vue'), name: 'docker' },
  ],
})

export default router
