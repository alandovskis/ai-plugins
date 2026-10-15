// A fill drawn as a bar of cells and its percentage, coloured by how full it
// is: the subagent band's context bars and the session panel's.
const BAR_CELLS = 10;
// The fill at which a gauge turns a warning, then an error.
const WARNING_PERCENT = 50;
const ERROR_PERCENT = 80;
// A whole percentage, 0 to 100.
export const percentOf = (part, whole) => Math.max(0, Math.min(100, Math.floor((part / whole) * 100)));
const levelOf = (percent) => {
    if (percent >= ERROR_PERCENT)
        return 'error';
    return percent >= WARNING_PERCENT ? 'warning' : 'success';
};
// `percent` is a whole percentage, 0 to 100.
export const gauge = ({ Text }, percent) => {
    const color = levelOf(percent);
    const used = Math.round(percent / (100 / BAR_CELLS));
    return (<Text>
      {used === 0 ? null : <Text color={color}>{'█'.repeat(used)}</Text>}
      {used === BAR_CELLS ? null : <Text dimColor>{'░'.repeat(BAR_CELLS - used)}</Text>}{' '}
      <Text color={color}>{percent}%</Text>
    </Text>);
};
