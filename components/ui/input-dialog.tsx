"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface InputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (value: string) => void
  title?: string
  description?: string
  placeholder?: string
  label?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  multiline?: boolean
  required?: boolean
}

export function InputDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "Input Required",
  description,
  placeholder,
  label,
  confirmText = "Submit",
  cancelText = "Cancel",
  loading = false,
  multiline = false,
  required = true,
}: InputDialogProps) {
  const [value, setValue] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (required && !value.trim()) return
    onSubmit(value)
    if (!loading) {
      setValue("")
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setValue("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-4">
            {label && (
              <Label htmlFor="input-field" className="mb-2 block">
                {label} {required && <span className="text-destructive">*</span>}
              </Label>
            )}
            {multiline ? (
              <Textarea
                id="input-field"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required={required}
                rows={4}
                className="resize-none"
                autoFocus
              />
            ) : (
              <Input
                id="input-field"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required={required}
                autoFocus
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button type="submit" disabled={loading || (required && !value.trim())}>
              {loading ? "Processing..." : confirmText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
