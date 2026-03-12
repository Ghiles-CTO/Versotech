'use client'

export function triggerBrowserDownload(url: string, fileName: string) {
  const link = window.document.createElement('a')
  link.href = url
  link.download = fileName
  window.document.body.appendChild(link)
  link.click()
  window.document.body.removeChild(link)
}

export async function downloadFileFromUrl(url: string, fileName: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch file for download')
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)

  try {
    triggerBrowserDownload(blobUrl, fileName)
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  }
}
