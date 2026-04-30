import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { blobs } = await list()

    // Filter for video files and return relevant info
    const videos = blobs
      .filter((blob) => 
        blob.pathname.endsWith('.mp4') || 
        blob.pathname.endsWith('.webm') || 
        blob.pathname.endsWith('.mov')
      )
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        filename: blob.pathname.split('/').pop() || 'unknown',
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }))

    return NextResponse.json({
      total: blobs.length,
      videos: videos,
      allFiles: blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        filename: blob.pathname.split('/').pop() || 'unknown',
      })),
    })
  } catch (error) {
    console.error('Error listing blobs:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
