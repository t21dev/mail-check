export interface EmailResult {
  email: string
  reachable: 'safe' | 'risky' | 'invalid' | 'unknown'
  syntax: { valid: boolean }
  mx: { found: boolean; records: string[] }
  smtp: { deliverable: boolean; responseCode: number | null; error?: string }
  isCatchAll: boolean
  isDisposable: boolean
}

export interface CheckResponse {
  results?: EmailResult[]
  error?: string
}
