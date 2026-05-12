import {
  aspectDynamic,
  classifyDay,
  findBody,
  lunarPhaseBasis,
  orbPhrase,
  ordinal,
  pair,
  phraseList,
  selectSignals,
  signalStory,
  signTexture,
  targetField,
  wordsFor,
} from './localPatterns.js';

function sentence(value) {
  const clean = String(value ?? '').trim();
  if (!clean) return '';
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function capitalize(value) {
  const clean = String(value ?? '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function conciseSignal(signal) {
  return `${signal.transitingBody} ${signal.aspect} natal ${signal.natalTarget}`;
}

function signalReceipt(signal) {
  return `${signal.title}, ${signal.orb} degree orb`;
}

function lunarWeather(currentSky) {
  const phase = currentSky.lunar.phase;
  const moonWords = phraseList(wordsFor(currentSky.lunar.moonSign), 3);
  const sunWords = phraseList(wordsFor(currentSky.lunar.sunSign), 2);
  return `The ${phase.toLowerCase()} Moon in ${currentSky.lunar.moonSign} gives the day its pulse: ${moonWords}, with ${currentSky.lunar.illumination}% light. The Sun in ${currentSky.lunar.sunSign} keeps the wider chapter around ${sunWords}.`;
}

function storySentence(story) {
  const { signal, transit, aspect, house } = story;
  const field = `your ${story.targetField}${signal.natalSign ? ` in ${signal.natalSign}` : ''}${house ? `, inside ${house}` : ''}`;
  return `Current ${signal.transitingBody} in ${signal.transitingSign} ${aspect.verb} ${field}. This brings ${transit.motive} into contact with ${pair(story.natalWords)}; ${aspect.work}.`;
}

function quietSentence({ natalChart, currentSky }) {
  const natalMoon = findBody(natalChart, 'Moon');
  const phaseBasis = lunarPhaseBasis(currentSky.lunar.phase);
  if (!natalMoon) {
    return `There is no single loud transit asking to dominate the day. The useful reading stays with the Moon's pacing: ${phaseBasis}`;
  }
  return `There is no single loud transit asking to dominate the day. Your natal Moon in ${natalMoon.sign} keeps the reading close to ${phraseList(wordsFor(natalMoon.sign), 3)}; ${phaseBasis}`;
}

export function buildHeadline(input) {
  const classification = classifyDay(input);
  const [top] = classification.selectedSignals;
  if (!top) return `${input.currentSky.lunar.moonSign} Moon, one honest thread.`;
  const story = signalStory(top);
  if (classification.tags.includes('lunar-pivot')) {
    return `${input.currentSky.lunar.phase} Moon, ${story.transit.noun} in focus.`;
  }
  if (classification.tags.includes('high-intensity')) {
    return `${capitalize(story.transit.noun)} meets your ${story.targetNoun}.`;
  }
  return `${top.transitingBody} asks for ${story.targetNoun} with proportion.`;
}

export function buildSummaryLine(input) {
  const classification = classifyDay(input);
  const [top] = classification.selectedSignals;
  if (!top) {
    return `Today is a ${input.currentSky.lunar.phase.toLowerCase()} ${input.currentSky.lunar.moonSign} Moon day: quiet attention matters more than dramatic meaning.`;
  }
  const story = signalStory(top);
  return `Today is led by ${conciseSignal(top)}: ${story.aspect.medicine}.`;
}

export function buildBody(input) {
  const classification = classifyDay(input);
  const stories = classification.selectedSignals.map(signalStory);
  const first = stories[0];
  const weather = lunarWeather(input.currentSky);
  if (!first) {
    return `${weather} ${quietSentence(input)} The local engine is keeping the reading close to what is actually present, so one honest adjustment is enough.`;
  }
  const second = stories[1]
    ? `A second thread, ${conciseSignal(stories[1].signal)}, stays in the room as context rather than taking over the whole reading.`
    : lunarPhaseBasis(input.currentSky.lunar.phase);
  const intensity = classification.tags.includes('high-intensity')
    ? 'The contact is tight enough to deserve care, but not certainty.'
    : 'The contact is readable without needing to become a whole-life explanation.';
  return `${weather} ${storySentence(first)} ${second} ${intensity}`;
}

export function buildLunarAxis({ natalChart, currentSky }) {
  const natalMoon = findBody(natalChart, 'Moon');
  const natalWords = wordsFor(natalMoon?.sign);
  const currentWords = wordsFor(currentSky.lunar.moonSign);
  const natalElement = natalMoon?.sign ? natalMoon.sign : 'the natal Moon';
  const natalHouse = natalMoon?.house ? ` through the ${ordinal(natalMoon.house)} house` : '';
  const relation = natalMoon?.sign === currentSky.lunar.moonSign
    ? 'the same lunar dialect returning with new weather'
    : `${currentSky.lunar.moonSign} translating ${natalElement}`;
  return {
    natal: {
      sign: natalMoon?.sign ?? 'Unknown',
      house: natalMoon?.house ? `${ordinal(natalMoon.house)} house` : 'house unknown',
      words: natalWords,
    },
    current: {
      sign: currentSky.lunar.moonSign,
      words: currentWords,
    },
    reading: `The current Moon speaks through ${currentSky.lunar.moonSign}'s ${phraseList(currentWords)}, while your natal Moon remembers ${natalMoon?.sign ?? 'its own'} ${phraseList(natalWords)}${natalHouse}. This is ${relation}: feeling may need translation before it becomes action. The axis is a way to listen for proportion, not a verdict about what must happen.`,
  };
}

export function buildActivations(input) {
  const stories = selectSignals(input.signals, 3).map(signalStory);
  if (!stories.length) {
    return [fallbackActivation(input)];
  }
  return stories.map((story) => {
    const { signal, aspect, transit } = story;
    const house = story.house ? ` The practical doorway is ${story.house}.` : '';
    const reading = `${storySentence(story)} The helpful move is to ${transit.safeMove}.${house}`;
    return {
      title: signal.title,
      activates: signal.activates,
      theme: reading,
      reading,
      question: transit.question,
      insight: `This is a ${orbPhrase(signal.orb)} ${signal.aspect} contact: ${aspect.feel}. The shadow to watch is ${aspect.risk}.`,
      score: signal.score,
    };
  });
}

function fallbackActivation({ currentSky }) {
  const phaseBasis = lunarPhaseBasis(currentSky.lunar.phase);
  const reading = `The Moon is ${currentSky.lunar.illumination}% lit in ${currentSky.lunar.moonSign}. ${phaseBasis} This gives the day a pulse even when the transit field is quiet.`;
  return {
    title: `${currentSky.lunar.phase} Moon in ${currentSky.lunar.moonSign}`,
    activates: 'daily feeling and rhythm',
    theme: reading,
    reading,
    question: 'What feeling is asking for proportion rather than proof?',
    insight: `Receipts: Moon in ${currentSky.lunar.moonSign}, ${currentSky.lunar.phase.toLowerCase()}, day ${currentSky.lunar.age} of the lunation.`,
    score: 0,
  };
}

export function buildFullReading(input) {
  const classification = classifyDay(input);
  const stories = classification.selectedSignals.map(signalStory);
  const [first, second, third] = stories;
  const paragraphs = [
    lunarWeather(input.currentSky),
  ];

  if (first) {
    paragraphs.push(`${storySentence(first)} The reason this matters is not that it predicts an outcome; it describes the part of the chart being pressed, warmed, mirrored, or opened today.`);
  } else {
    paragraphs.push(quietSentence(input));
  }

  if (second) {
    paragraphs.push(`${sentence(storySentence(second))} This secondary contact gives the reading texture. It can be included without letting the day become crowded with every possible transit.`);
  } else if (classification.tags.includes('lunar-pivot')) {
    paragraphs.push(`Because this is a lunar pivot, the phase itself belongs near the center. ${sentence(lunarPhaseBasis(input.currentSky.lunar.phase))}`);
  } else {
    paragraphs.push('The local engine is choosing restraint here. A quieter sky can still be useful when it lets the body, the calendar, and one clear sentence catch up with each other.');
  }

  if (third) {
    paragraphs.push(`${sentence(storySentence(third))} This is background support, not another assignment. It helps name the weather around the main contact.`);
  }

  paragraphs.push(buildLunarAxis(input).reading);

  const closing = first
    ? `The useful experiment is to ${first.transit.safeMove}. The day does not need a grand answer; it needs one honest relationship between the sky receipt, the natal pattern, and what can actually be carried.`
    : 'The useful experiment is to let the day stay small enough to be lived. A quiet reading can still be accurate when it protects attention from borrowed urgency.';
  paragraphs.push(closing);

  return paragraphs.join('\n\n');
}

export function buildGlanceItems(input) {
  const stories = selectSignals(input.signals, 3).map(signalStory);
  const phaseBasis = lunarPhaseBasis(input.currentSky.lunar.phase);
  const items = [
    stories[0]
      ? `${stories[0].signal.transitingBody} is the loudest local signal; it touches ${stories[0].targetNoun}.`
      : `The ${input.currentSky.lunar.phase} Moon in ${input.currentSky.lunar.moonSign} sets a quieter daily tone.`,
    `The Moon is ${input.currentSky.lunar.illumination}% lit, so ${phaseBasis}`,
  ];
  if (stories[1]) items.push(`${stories[1].signal.transitingBody} adds context around ${stories[1].targetNoun}.`);
  if (stories[2]) items.push(`${stories[2].signal.transitingBody} is present, but it should not crowd the main signal.`);
  items.push('One useful adjustment is enough for the local reading.');
  return items.slice(0, 5).map(sentence);
}

export function buildNotice(input) {
  const classification = classifyDay(input);
  const stories = classification.selectedSignals.map(signalStory);
  const [top, second] = stories;
  const moonSign = input.currentSky.lunar.moonSign;
  const phaseWords = pair(wordsFor(moonSign));
  return [
    top ? `${top.signal.transitingBody} touching ${top.signal.natalTarget}: your ${targetField(top.signal.natalTarget)} may speak first.` : `${moonSign} Moon: ${phaseWords} may speak first.`,
    top?.house ? `${capitalize(top.house)} is the practical doorway.` : `${signTexture(moonSign)} as today's body metaphor.`,
    second ? `${conciseSignal(second.signal)} as context, not a second center.` : `${input.currentSky.lunar.phase}: ${lunarPhaseBasis(input.currentSky.lunar.phase)}`,
    classification.tags.includes('outer-planet-heavy') ? 'Slow pressure asking for a small form.' : 'The first honest sentence before polish.',
  ].map(sentence);
}

export function buildAvoid(input) {
  const classification = classifyDay(input);
  const stories = classification.selectedSignals.map(signalStory);
  const [top] = stories;
  return [
    'Turning a symbol into a rule.',
    top ? `${capitalize(top.transit.noun)} becoming a whole-life verdict.` : 'Quiet sky filled with borrowed urgency.',
    top ? `${capitalize(top.aspect.risk)}.` : 'A small signal being inflated into certainty.',
    classification.tags.includes('high-intensity') ? 'Treating intensity as proof.' : 'Body metaphor treated as diagnosis.',
  ].map(sentence);
}

export function buildRelease(input) {
  const [top] = selectSignals(input.signals, 1).map(signalStory);
  if (!top) return 'The pressure to make a quiet day more dramatic than it is can loosen.';
  return `${capitalize(top.aspect.risk)} around ${top.targetNoun} can loosen.`;
}

export function buildAct(input) {
  const [top] = selectSignals(input.signals, 1).map(signalStory);
  if (!top) return 'One small action may make the body feel more settled.';
  return `One clean move may help you ${top.transit.safeMove}.`;
}

export function buildReceipts({ currentSky, signals }) {
  return [
    `${currentSky.lunar.phase} Moon in ${currentSky.lunar.moonSign}, ${currentSky.lunar.illumination}% lit`,
    ...selectSignals(signals, 3).map(signalReceipt),
  ];
}

export function buildLoudestSignals(signals) {
  return selectSignals(signals, 3).map((signal) => {
    const aspect = aspectDynamic(signal.aspect);
    return {
      title: signal.title,
      activates: signal.activates,
      score: signal.score,
      orb: signal.orb,
      reason: signal.reasons?.join(' | ') ?? aspect.work,
    };
  });
}
