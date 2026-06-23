import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  base64DataUri: string,
  folder = 'millyplayer/covers'
): Promise<string> {
  const result = await cloudinary.uploader.upload(base64DataUri, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  })
  return result.secure_url
}

export async function uploadAudio(
  base64DataUri: string,
  folder = 'millyplayer/audio'
): Promise<string> {
  const result = await cloudinary.uploader.upload(base64DataUri, {
    folder,
    resource_type: 'video',
  })
  return result.secure_url
}

export async function deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image') {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export function extractPublicId(url: string): string {
  const parts = url.split('/')
  const filename = parts[parts.length - 1].split('.')[0]
  const folderIndex = parts.findIndex((p) => p === 'millyplayer')
  if (folderIndex === -1) return filename
  return parts.slice(folderIndex).join('/').replace(/\.[^/.]+$/, '')
}
