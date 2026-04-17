import axios from 'axios'

export interface ValidationResult {
  url: string
  isWorking: boolean
  statusCode?: number
}

export async function validateLink(url: string): Promise<ValidationResult> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      validateStatus: () => true,
    })
    return { url, isWorking: [200, 201, 301, 302, 307, 308].includes(response.status), statusCode: response.status }
  } catch {
    return { url, isWorking: false }
  }
}
