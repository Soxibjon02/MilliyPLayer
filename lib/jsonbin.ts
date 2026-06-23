import { DBData, Song, User, Category } from './types'

const BASE_URL = 'https://api.jsonbin.io/v3/b'

const headers = () => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Master-Key': process.env.JSONBIN_MASTER_KEY!,
  }
  if (process.env.JSONBIN_API_KEY) h['X-Access-Key'] = process.env.JSONBIN_API_KEY
  return h
}

async function readBin<T>(binId: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${binId}/latest`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`JSONBin read failed: ${res.status}`)
  const json = await res.json()
  return json.record as T
}

async function writeBin<T>(binId: string, data: T): Promise<void> {
  const res = await fetch(`${BASE_URL}/${binId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`JSONBin write failed: ${res.status}`)
}

// Songs bin
export async function getSongs(): Promise<Song[]> {
  try {
    const data = await readBin<{ songs: Song[] }>(process.env.JSONBIN_BIN_SONGS!)
    return data.songs ?? []
  } catch {
    return []
  }
}

export async function saveSongs(songs: Song[]): Promise<void> {
  await writeBin(process.env.JSONBIN_BIN_SONGS!, { songs })
}

// Users bin
export async function getUsers(): Promise<User[]> {
  try {
    const data = await readBin<{ users: User[] }>(process.env.JSONBIN_BIN_USERS!)
    return data.users ?? []
  } catch {
    return []
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  await writeBin(process.env.JSONBIN_BIN_USERS!, { users })
}

// Categories bin
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await readBin<{ categories: Category[] }>(process.env.JSONBIN_BIN_CATEGORIES!)
    return data.categories ?? []
  } catch {
    return []
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await writeBin(process.env.JSONBIN_BIN_CATEGORIES!, { categories })
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
