function cleanText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function compactLines(lines) {
  return lines
    .map((line) => (typeof line === 'string' ? line.trimEnd() : line))
    .filter((line, index, list) => {
      if (line !== '') return Boolean(line);
      return index > 0 && list[index - 1] !== '' && list[index + 1] !== '';
    })
    .join('\n')
    .trim();
}

function listBlock(title, items = []) {
  const cleanItems = items.map(cleanText).filter(Boolean);
  if (!cleanItems.length) return [];
  return [
    title,
    ...cleanItems.map((item) => `- ${item}`),
  ];
}

function activationBlock(activation, index) {
  if (!activation) return [];
  const title = cleanText(activation.title) || `Activation ${index + 1}`;
  const activates = cleanText(activation.activates);
  return [
    `${index + 1}. ${title}${activates ? ` (${activates})` : ''}`,
    cleanText(activation.theme),
    activation.question ? `Question: ${cleanText(activation.question)}` : '',
    cleanText(activation.insight),
  ].filter(Boolean);
}

function lunarSummary({ sky, entry }) {
  const phase = cleanText(sky?.lunar?.phase ?? entry?.phase);
  const sign = cleanText(sky?.lunar?.moonSign ?? entry?.moonSign);
  const illumination = sky?.lunar?.illumination ?? entry?.illumination;
  const parts = [
    phase,
    sign ? `Moon in ${sign}` : '',
    illumination !== undefined && illumination !== null ? `${illumination}% lit` : '',
  ].filter(Boolean);
  return parts.join(' · ');
}

function axisBlock(reading) {
  const axis = reading?.lunarAxis;
  if (!axis) return [];
  return [
    'Moon axis',
    `Natal Moon: ${cleanText(axis.natal?.sign)}${axis.natal?.house ? `, ${cleanText(axis.natal.house)}` : ''}`,
    `Sky Moon: ${cleanText(axis.current?.sign)} now`,
    cleanText(axis.reading),
  ].filter(Boolean);
}

export function buildReadingSharePayload({ reading, sky, entry } = {}) {
  const headline = cleanText(reading?.headline ?? entry?.headline ?? 'MoonTurtle reading');
  const localDate = cleanText(sky?.localDate ?? entry?.localDate ?? entry?.dateKey);
  const lunar = lunarSummary({ sky, entry });
  const activations = reading?.activations ?? [];
  const fallbackLine = reading?.isFallback
    ? 'Source note: MoonTurtle local synthesis from calculated receipts.'
    : '';

  const text = compactLines([
    'MoonTurtle reading',
    localDate,
    lunar,
    '',
    headline,
    '',
    cleanText(reading?.fullReading ?? reading?.body),
    fallbackLine,
    '',
    ...listBlock('Quick glance', reading?.glanceItems),
    '',
    reading?.release ? `Release: ${cleanText(reading.release)}` : '',
    reading?.act ? `Act: ${cleanText(reading.act)}` : '',
    '',
    ...axisBlock(reading),
    '',
    ...(activations.length
      ? [
          'Activations',
          ...activations.flatMap((activation, index) => [
            ...activationBlock(activation, index),
            '',
          ]),
        ]
      : []),
    ...listBlock('What to notice', reading?.notice),
    '',
    ...listBlock('What to avoid overdoing', reading?.avoid),
    '',
    'Meaningful enough to contemplate. Never absolute enough to obey.',
  ]);

  return {
    title: headline,
    text,
  };
}
