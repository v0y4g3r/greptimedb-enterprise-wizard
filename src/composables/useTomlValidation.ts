import { computed } from 'vue'
import { parse as parseToml } from 'smol-toml'

export interface TomlValidationResult {
  valid: boolean
  error: string | null
  line: number | null
  column: number | null
}

export function useTomlValidation(getter: () => string) {
  return computed<TomlValidationResult>(() => {
    const text = getter().trim()
    if (!text) {
      return { valid: true, error: null, line: null, column: null }
    }
    try {
      parseToml(text)
      return { valid: true, error: null, line: null, column: null }
    } catch (e: any) {
      const msg = e?.message || 'Invalid TOML'
      const line = typeof e?.line === 'number' ? e.line : null
      const col = typeof e?.column === 'number' ? e.column : null
      return { valid: false, error: msg, line, column: col }
    }
  })
}
