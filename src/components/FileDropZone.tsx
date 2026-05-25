/**
 * FileDropZone.tsx
 * 拖拽文件上传组件 - 支持拖拽+点击上传，文件列表管理
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

interface FileDropZoneProps {
  onFilesChange: (files: UploadedFile[]) => void;
  uploadUrl?: string;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropZone({
  onFilesChange,
  uploadUrl = "/api/upload/milestone",
  accept,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
}: FileDropZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const remaining = maxFiles - files.length;
      if (remaining <= 0) return;

      const toUpload = Array.from(fileList).slice(0, remaining);
      setUploading(true);

      const results: UploadedFile[] = [];
      for (const file of toUpload) {
        if (file.size > maxSize) continue;

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch(uploadUrl, { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            results.push(data);
          }
        } catch (err) {
          console.error("Upload failed:", err);
        }
      }

      const updated = [...files, ...results];
      setFiles(updated);
      onFilesChange(updated);
      setUploading(false);
    },
    [files, maxFiles, maxSize, uploadUrl, onFilesChange]
  );

  const removeFile = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragover
            ? "border-[#007aff] bg-[#007aff0d]"
            : "border-[var(--g-border)] hover:border-[#007aff]"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragover(false);
          if (e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
          }
        }}
      >
        {uploading ? (
          <div className="text-xs text-[var(--g-text2)] py-2">上传中...</div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-2">
            <Upload className="w-5 h-5 text-[var(--g-text2)]" />
            <span className="text-xs text-[var(--g-text2)]">
              拖拽文件到此处或<span className="text-[#007aff]">点击上传</span>
            </span>
            <span className="text-[10px] text-[var(--g-text2)]">
              最多 {maxFiles} 个文件，单文件最大 {formatSize(maxSize)}
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((f, i) => (
            <div
              key={f.filename}
              className="flex items-center gap-2 bg-[var(--g-input)] rounded-lg px-3 py-1.5 text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--g-text2)] flex-shrink-0" />
              <span className="flex-1 min-w-0 truncate">{f.originalName}</span>
              <span className="text-[var(--g-text2)] flex-shrink-0">{formatSize(f.fileSize)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-[var(--g-text2)] hover:text-[#ff3b30] cursor-pointer flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
