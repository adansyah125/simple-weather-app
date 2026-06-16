import { useCallback, useSyncExternalStore } from 'react'

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function subscribe(callback) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getServerSnapshot() {
  return false
}

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle('dark')
  }, [])

  const setTheme = useCallback((dark) => {
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  return { isDark, toggleTheme, setTheme }
}
