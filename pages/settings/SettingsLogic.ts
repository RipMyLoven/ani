import { ref } from 'vue'

interface User {
  id: number
  username: string
  avatar: string
  tags: string[]
  email: string
}

export function useSettingsLogic() {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Получение данных пользователя с API
  const fetchUser = async () => {
    isLoading.value = true
    try {
      const response = await $fetch<User>('/api/user/me')
      user.value = response
    } catch (e) {
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Пример функции выхода
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    window.location.href = '/login'
  }

  // Загружаем пользователя при инициализации
  fetchUser()

  return {
    user,
    isLoading,
    fetchUser,
    logout,
  }
}