// Tiny pixel-art sprites drawn from character maps. Each character is one pixel;
// "." is transparent. Rendered as crisp SVG rects so they scale without blurring.

const C = {
  M: '#5a4636', // mocha outline
  G: '#668b4a', // matcha
  g: '#7fa060', // light matcha
  D: '#3f5a2c', // dark matcha
  F: '#f8f1dc', // foam
  W: '#fffaf0', // white foam
  S: '#8a7563', // steam
  P: '#efe3d6', // saucer
  R: '#c8553d', // berry
  r: '#e07a63', // light berry
  Y: '#e8c15a', // lemon
  y: '#fbe9a0', // light lemon
  T: '#2b241e', // terminal
  t: '#c9e3a8', // phosphor
  B: '#a9d6e6', // sky
};

const SPRITES = {
  cup: [
    '.....S...S......',
    '......S...S.....',
    '.....S...S......',
    '................',
    '.MMMMMMMMMMMMM..',
    'MgggggggggggggM.',
    'MGGGFFGGGFFGGGMMM',
    'MGGGFFFFFFFGGGM.M',
    'MWGGGFFFFFGGGWM.M',
    'MWWWWGFFFGWWWWMMM',
    'MWWWWWWWWWWWWWM..',
    '.MWWWWWWWWWWWM...',
    '..MMMMMMMMMMMM...',
    'PPPPPPPPPPPPPPPP.',
    '.PPPPPPPPPPPPPP..',
  ],
  heart: [
    '.MM...MM.',
    'MrRM.MrRM',
    'MrRRMRRRM',
    'MRRRRRRRM',
    '.MRRRRRM.',
    '..MRRRM..',
    '...MRM...',
    '....M....',
  ],
  folder: [
    '.MMMM.....',
    'MyyyyMMMMM',
    'MYYYYYYYYM',
    'MMMMMMMMMM',
    'MyyyyyyyyM',
    'MYYYYYYYYM',
    'MYYYYYYYYM',
    'MMMMMMMMMM',
  ],
  calendar: [
    '.M..M..M.',
    'MMMMMMMMM',
    'MGGGGGGGM',
    'MMMMMMMMM',
    'MWWWWWWWM',
    'MWRWWWWWM',
    'MWWWWGWWM',
    'MWWWWWWWM',
    'MMMMMMMMM',
  ],
  team: [
    '..MM...MM..',
    '.MFFM.MFFM.',
    '.MFFM.MFFM.',
    '..MM...MM..',
    '.MGGM.MGGM.',
    'MGGGGMGGGGM',
    'MGGGGMGGGGM',
    'MMMMMMMMMMM',
  ],
  card: [
    'MMMMMMMMMMM',
    'MWWWWWWWWWM',
    'MWGGWWMMMWM',
    'MWGGWWWWWWM',
    'MWMMWWMMWWM',
    'MWWWWWWWWWM',
    'MMMMMMMMMMM',
  ],
  terminal: [
    'MMMMMMMMMMM',
    'MTTTTTTTTTM',
    'MTtTTTTTTTM',
    'MTTtTTTTTTM',
    'MTtTTttttTM',
    'MTTTTTTTTTM',
    'MMMMMMMMMMM',
  ],
  sparkle: ['...Y...', '...Y...', '..YyY..', 'YYyyyYY', '..YyY..', '...Y...', '...Y...'],
  warning: [
    '....M....',
    '...MYM...',
    '...MYM...',
    '..MYMYM..',
    '..MYMYM..',
    '.MYYMYYM.',
    '.MYYYYYM.',
    'MYYYMYYYM',
    'MMMMMMMMM',
  ],
} as const;

export type SpriteName = keyof typeof SPRITES;

export function Pixel({
  sprite,
  scale = 4,
  className = '',
  label,
}: {
  sprite: SpriteName;
  /** Size of one pixel in CSS px. */
  scale?: number;
  className?: string;
  /** Accessible name; omit for decorative sprites. */
  label?: string;
}) {
  const rows = SPRITES[sprite];
  const width = Math.max(...rows.map((r) => r.length));
  const height = rows.length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const fill = C[ch as keyof typeof C];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />);
    }),
  );
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width * scale}
      height={height * scale}
      className={`pixelated shrink-0 ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects}
    </svg>
  );
}
