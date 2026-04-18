export interface ValidationResult {
  valid: boolean
  error?: string
}

const ALLOWED_EXTENSIONS = ['csv', 'pdf', 'xlsx', 'xls'] as const
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): ValidationResult {
  // Check extension
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type ".${ext ?? 'unknown'}". Only CSV, PDF, XLSX, XLS allowed.`,
    }
  }

  // Check size
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `"${file.name}" is ${sizeMB}MB. Maximum allowed size is 10MB.`,
    }
  }

  // Prevent path traversal — only allow safe filename chars
  if (/[\/\\<>:"|?*\x00-\x1f]/.test(file.name)) {
    return {
      valid: false,
      error: `Invalid filename "${file.name}". Avoid special characters.`,
    }
  }

  return { valid: true }
}

export function validateFiles(files: File[]): ValidationResult {
  for (const file of files) {
    const result = validateFile(file)
    if (!result.valid) return result
  }
  return { valid: true }
}
