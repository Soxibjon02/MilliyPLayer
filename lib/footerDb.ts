import { FooterSettings } from '@/lib/footerTypes'

export const defaultFooterSettings: FooterSettings = {
  email: 'soxibgaybullayev439@gmail.com',
  developerName: 'Sokhib Khaybullayev',
  developerRole: 'Full-stack Developer',
  description: "O'zbek milliy musiqasini sevuvchilar uchun zamonaviy musiqa streaming platforma.",
  techStack: 'Next.js 14, TypeScript, Tailwind CSS, Cloudinary va JSONBin.io bilan qurildi.'
}

const BASE_URL = 'https://api.jsonbin.io/v3/b'
const headers = () => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Master-Key': process.env.JSONBIN_MASTER_KEY!,
  }
  if (process.env.JSONBIN_API_KEY) h['X-Access-Key'] = process.env.JSONBIN_API_KEY
  return h
}

// Memory cache as fallback in case JSONBin isn't configured or fails
let memoryFooterCache: FooterSettings = defaultFooterSettings

export async function getFooterSettings(): Promise<FooterSettings> {
  const binId = process.env.JSONBIN_BIN_FOOTER
  if (!binId) return memoryFooterCache
  try {
    const res = await fetch(`${BASE_URL}/${binId}/latest`, {
      headers: headers(),
      cache: 'no-store',
    })
    if (!res.ok) return memoryFooterCache
    const json = await res.json()
    return (json.record as FooterSettings) ?? memoryFooterCache
  } catch {
    return memoryFooterCache
  }
}

export async function saveFooterSettings(settings: FooterSettings): Promise<void> {
  memoryFooterCache = settings
  const binId = process.env.JSONBIN_BIN_FOOTER
  if (!binId) {
    // If not configured, we save in memory and try dynamically creating a bin if possible
    console.log('JSONBIN_BIN_FOOTER is not set. Saving footer to memory cache.')
    return
  }
  const res = await fetch(`${BASE_URL}/${binId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(settings),
  })
  if (!res.ok) {
    console.error(`JSONBin write failed with status ${res.status}. Saved in-memory.`)
  }
}

