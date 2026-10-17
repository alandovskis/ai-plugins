import type { Elements, RenderChildren, RenderSurface } from 'claude-code'

// A titled box above the prompt: the session panel's and the subagent band's.
// The terminal draws it in a rounded border with the title over the top row.
// Any other surface draws a bordered box as a card, and above its prompt a
// card reads as a pasted image, so there it is plain rows, the title first.

// The rows the frame takes beyond its body: on the terminal its top and
// bottom borders, elsewhere its title and one to spare.
export const FRAME_ROWS = 2

export const frame = (
  { Box, Text }: Pick<Elements[RenderSurface], 'Box' | 'Text'>,
  surface: string,
  { key, columns, title }: { key: string; columns: number; title: RenderChildren },
  body: RenderChildren,
) =>
  surface === 'terminal' ? (
    <Box key={key} flexDirection="column" width={columns} borderStyle="round" borderDimColor paddingX={1}>
      <Box key={`${key}-title`} position="absolute" top={-1} left={1}>
        <Text>{title}</Text>
      </Box>
      {body}
    </Box>
  ) : (
    <Box key={key} flexDirection="column">
      <Box key={`${key}-title`}>
        <Text>{title}</Text>
      </Box>
      {body}
    </Box>
  )
