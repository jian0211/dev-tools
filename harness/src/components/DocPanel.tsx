import { Box, Text } from 'ink'

type Props = {
  folderName: string
  fileName: string
  content: string
  pendingContent: string | null
  isEditable: boolean
}

export function DocPanel({
  folderName,
  fileName,
  content,
  pendingContent,
  isEditable,
}: Props) {
  const hasPending = !!pendingContent
  const displayContent = hasPending ? pendingContent : content
  // 터미널 높이에 맞게 줄 제한
  const lines = (displayContent || '').split('\n').slice(0, 20)

  return (
    <Box flexDirection="column" width={36} borderStyle="single">
      <Box paddingX={1} justifyContent="space-between">
        <Text>
          <Text dimColor>{folderName}/</Text>
          <Text bold>{fileName}</Text>
        </Text>
        {hasPending && <Text color="yellow"> 미리보기</Text>}
        {!hasPending && !isEditable && <Text dimColor> 읽기전용</Text>}
      </Box>

      <Box flexDirection="column" flexGrow={1} paddingX={1} marginTop={1}>
        {lines.length === 0 ? (
          <Text dimColor>(비어있음)</Text>
        ) : (
          lines.map((line, i) => {
            const key = `line-${i}`
            return (
              <Text key={key} color={hasPending ? 'yellow' : 'white'} wrap="truncate">
                {line}
              </Text>
            )
          })
        )}
      </Box>

      {hasPending && (
        <Box paddingX={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
          <Text color="green" bold>[y] 승인</Text>
          <Text> </Text>
          <Text color="red">[n] 거절</Text>
        </Box>
      )}
    </Box>
  )
}
