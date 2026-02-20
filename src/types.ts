export interface EmailResult {
  email: string
  reachable: 'safe' | 'risky' | 'invalid' | 'unknown'
  syntax: { valid: boolean }
  mx: { found: boolean; records: string[] }
  smtp: { deliverable: boolean; responseCode?: string }
  isCatchAll: boolean
  isDisposable: boolean
}

export interface CheckResponse {
  results?: EmailResult[]
  error?: string
}
