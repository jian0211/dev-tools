import { Box, Text } from 'ink'
import type { FileEntry } from '../model/types.js'

type FolderInfo = {
  folderName: string
  label: string
  hasFiles: boolean
}

type Props = {
  folders: FolderInfo[]
  activeFolderName: string
  files: FileEntry[]
  activeFileName: string
  selectedIndex: number
}

export function Sidebar({
  folders,
  activeFolderName,
  files,
  activeFileName,
  selectedIndex,
}: Props) {
  return (
    <Box flexDirection="column" width={16} borderStyle="single" borderRight>
      {folders.map((f) => (
        <Box key={f.folderName} paddingX={1}>
          <Text
            bold={f.folderName === activeFolderName}
            color={f.folderName === activeFolderName ? 'green' : f.hasFiles ? 'white' : 'gray'}
          >
            {f.folderName === activeFolderName ? '▸ ' : '  '}
            {f.label}
            {f.hasFiles ? ' ✓' : ''}
          </Text>
        </Box>
      ))}

      <Box marginTop={1} paddingX={1}>
        <Text dimColor>── 파일 ──</Text>
      </Box>

      {files.length === 0 ? (
        <Box paddingX={1}>
          <Text dimColor>(비어있음)</Text>
        </Box>
      ) : (
        files.map((file, i) => (
          <Box key={file.name} paddingX={1}>
            <Text
              bold={file.name === activeFileName}
              color={i === selectedIndex ? 'cyan' : file.kind === 'history' ? 'gray' : 'white'}
            >
              {i === selectedIndex ? '▸ ' : '  '}
              {file.name}
            </Text>
          </Box>
        ))
      )}
    </Box>
  )
}
