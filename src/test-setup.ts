import '@testing-library/jest-dom'

class LocalStorageMock {
  private store: Record<string, string> = {}
  clear() { this.store = {} }
  getItem(key: string) { return this.store[key] ?? null }
  setItem(key: string, value: string) { this.store[key] = String(value) }
  removeItem(key: string) { delete this.store[key] }
  key(n: number) { return Object.keys(this.store)[n] ?? null }
  get length() { return Object.keys(this.store).length }
}

Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() })
