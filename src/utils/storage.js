function isStorageAvailable(type) {
  try {
    const storage = window[type]
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export const storage = {
  isAvailable: isStorageAvailable('localStorage'),

  getItem(key) {
    if (!this.isAvailable) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  setItem(key, value) {
    if (!this.isAvailable) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('LocalStorage quota exceeded')
      }
      return false
    }
  },

  removeItem(key) {
    if (!this.isAvailable) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  getObject(key) {
    const raw = this.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  setObject(key, value) {
    try {
      return this.setItem(key, JSON.stringify(value))
    } catch {
      return false
    }
  },
}
