import { Box, Text } from 'ink'

type Props = {
  message: string
}

export function ErrorView({ message }: Props) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="red" bold>오류 발생</Text>
      <Text color="red">{message}</Text>
      <Text />
      <Text dimColor>아무 키: 계속 / q: 종료</Text>
    </Box>
  )
}
