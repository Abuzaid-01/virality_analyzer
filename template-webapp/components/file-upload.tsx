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

  if (file) {
    return (
      <div className="relative glass rounded-2xl p-6 glow-border animate-fade-in">
        <div className="flex items-start gap-5">
          {/* Preview / Icon */}
          <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-white/[0.04] flex items-center justify-center overflow-hidden border border-white/[0.06]">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : isVideo ? (
              <FileVideo className="w-8 h-8 text-violet-400" />
            ) : (
              <Image className="w-8 h-8 text-violet-400" />
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB · {isVideo ? "Video" : "Image"}
            </p>
            {isUploading && (
              <div className="flex items-center gap-2 mt-3">
                <div className="h-1.5 flex-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-shimmer" style={{ width: '60%' }} />
                </div>
                <span className="text-xs text-violet-400 font-medium">Uploading...</span>
              </div>
            )}
          </div>

          {/* Remove button */}
          {!isUploading && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
          relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
          transition-all duration-300
          ${dragActive
            ? "border-violet-500/50 bg-violet-500/5 scale-[1.01] shadow-lg shadow-violet-500/10"
            : "border-white/[0.08] hover:border-violet-500/30 hover:bg-white/[0.02]"
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
        <div className="flex flex-col items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragActive
              ? "bg-gradient-to-br from-violet-500/30 to-purple-500/30 scale-110"
              : "bg-gradient-to-br from-violet-500/10 to-purple-500/10"
          }`}>
            <Upload className={`w-7 h-7 transition-colors ${dragActive ? "text-violet-300" : "text-violet-400"}`} />
          </div>
          <div>
            <p className="text-base font-semibold">
              {dragActive ? "Drop your file here" : "Drag & drop your content"}
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              or click to browse · MP4, MOV, WebM, JPG, PNG · max {maxSizeMb}MB
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-sm text-rose-400 mt-3 flex items-center gap-2 glass rounded-xl px-4 py-3">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
