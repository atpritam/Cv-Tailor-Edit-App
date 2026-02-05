import React from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

type FileUploadInputProps = {
  file: File | null;
  error?: string;
  placeholderText: string;
  fileTypeDescription: string;
};

export function FileUploadInput({
  file,
  error,
  placeholderText,
  fileTypeDescription,
}: FileUploadInputProps) {
  return (
    <div
      className={`relative p-6 transition-all ${file ? "bg-primary/5" : ""}`}
    >
      {error && (
        <div className="absolute inset-0 p-4 flex items-start gap-2 text-sm text-destructive pointer-events-none">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {file ? (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              File uploaded successfully
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {placeholderText}
            </p>
            <p className="text-xs text-muted-foreground">
              {fileTypeDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
