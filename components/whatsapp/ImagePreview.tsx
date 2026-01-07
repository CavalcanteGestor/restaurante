"use client"

import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

interface ImagePreviewProps {
  imageUrl: string
  caption?: string
  onClose: () => void
}

export default function ImagePreview({ imageUrl, caption, onClose }: ImagePreviewProps) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'imagem-whatsapp.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </Button>
        <Button
          onClick={handleDownload}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Download className="h-6 w-6" />
        </Button>
      </div>

      {/* Imagem */}
      <div className="flex-1 flex items-center justify-center p-8">
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Caption */}
      {caption && (
        <div className="p-4 bg-black/50">
          <p className="text-white text-center">{caption}</p>
        </div>
      )}
    </div>
  )
}

