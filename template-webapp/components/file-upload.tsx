"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, X, FileVideo, Image, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type FileUploadProps = {
  onFileSelect: (file: File) => void
  file: File | null
  onClear: () => void
  isUploading: boolean
  maxSizeMb?: number
}

const ALLOWED_VIDEO = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"]
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const ALL_ALLOWED = [...ALLOWED_VIDEO, ...ALLOWED_IMAGE]

export function FileUpload({ onFileSelect, file, onClear, isUploading, maxSizeMb = 100 }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((f: File): boolean => {
    setError(null)
    if (!ALL_ALLOWED.includes(f.type)) {
      setError(`Unsupported format: ${f.type.split("/")[1]}. Use MP4, MOV, WebM, JPG, PNG, or WebP.`)
      return false
    }
    if (f.size > maxSizeMb * 1024 * 1024) {
      setError(`File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max ${maxSizeMb}MB.`)
      return false
    }
    return true
  }, [maxSizeMb])

  const handleFile = useCallback((f: File) => {
    if (!validateFile(f)) return
    // Create preview for images
    if (ALLOWED_IMAGE.includes(f.type)) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
    onFileSelect(f)
  }, [validateFile, onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }, [handleFile])

  const isVideo = file && ALLOWED_VIDEO.includes(file.type)
  const isImage = file && ALLOWED_IMAGE.includes(file.type)

  if (file) {
    return (
      <div className="relative rounded-2xl border border-border/50 bg-card/30 p-6">
        <div className="flex items-start gap-4">
          {/* Preview / Icon */}
          <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : isVideo ? (
              <FileVideo className="w-8 h-8 text-primary" />
            ) : (
              <Image className="w-8 h-8 text-primary" />
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB · {isVideo ? "Video" : "Image"}
            </p>
            {isUploading && (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-xs text-primary">Uploading...</span>
              </div>
            )}
          </div>

          {/* Remove button */}
          {!isUploading && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => {
                onClear()
                setPreview(null)
                setError(null)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`
          relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
          transition-all duration-200
          ${dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/50 hover:border-primary/50 hover:bg-white/[0.02]"
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ALL_ALLOWED.join(",")}
          onChange={handleChange}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-medium">
              {dragActive ? "Drop your file here" : "Drag & drop your content"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse · MP4, MOV, WebM, JPG, PNG · max {maxSizeMb}MB
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-3 flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}
