export type FileItem = {
  id: string
  name: string
  template: string
}

export type Phase = {
  id: string
  label: string
  files: FileItem[]
}
