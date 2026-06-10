/**
 * All typing practice topics with their contexts
 * These are the 8 core typing practice topics
 */
export const topics = [
  {
    id: 0,
    name: "Nature",
    difficulty: "easy",
    context: "Immerse yourself in the quiet power of the wild. Ancient forests breathe with life, their canopies filtering golden sunlight into dancing patterns on moss-covered ground. Rivers sing their eternal songs, carving through stone with patient determination. Mountains stand as silent sentinels, their peaks touching clouds that drift across vast skies. In nature's embrace, you find both solitude and belonging, peace and purpose intertwined."
  },
  {
    id: 1,
    name: "City",
    difficulty: "medium",
    context: "Urban landscapes pulse with endless energy and motion. Towering skyscrapers reach toward the heavens, their glass facades reflecting the dynamic life below. Streets teem with millions of stories, each person carrying their own dreams, struggles, and triumphs. The city never sleeps, constantly evolving, adapting, pushing boundaries. From quiet parks nestled between concrete towers to vibrant markets bursting with color and sound, the city offers infinite possibilities for those who dare to explore."
  },
  {
    id: 2,
    name: "Night",
    difficulty: "medium",
    context: "Darkness descends like a gentle veil, transforming the world into something mysterious and profound. Stars emerge one by one, ancient light traveling across infinite void to grace our eyes. The night brings silence, a respite from the day's relentless demands. In darkness, imagination flourishes, dreams take shape, and the soul finds space to breathe. Moonlight paints silver paths across sleeping cities, through quiet forests, casting everything in ethereal beauty and timeless contemplation."
  },
  {
    id: 3,
    name: "Waterfall",
    difficulty: "hard",
    context: "Water cascades with tremendous force, plummeting from towering heights in a magnificent display of nature's raw power. The thunderous roar echoes through surrounding canyons, a primal symphony of movement and energy. Mist rises like ghostly apparitions, catching sunlight and creating transient rainbows. Below, churning pools of crystalline water merge and continue their eternal journey downstream. Every drop carries the story of mountains, glaciers, and distant lands, uniting in this singular moment of spectacular descent and transformation."
  },
  {
    id: 4,
    name: "Ocean",
    difficulty: "hard",
    context: "Waves roll endlessly across vast horizons, their rhythm synchronized with ancient tides governed by celestial bodies. The ocean's depths hold mysteries yet undiscovered, a realm of wonder and untamed wilderness. Salt air fills your lungs, invigorating and grounding, connecting you to something infinitely larger than yourself. Sunlight dances across rippling surfaces, illuminating the profound beauty beneath. The ocean teaches humility, perspective, and respect for the forces that shape our world and sustain all life."
  },
  {
    id: 5,
    name: "Forest",
    difficulty: "easy",
    context: "Towering trees create a cathedral of green, their branches intertwining to form a protective canopy. Sunlight filters through in scattered beams, illuminating the forest floor where countless lives thrive in intricate balance. The air smells of earth, growth, and ancient decomposition giving birth to new life. Every sound tells a story: birds singing territorial songs, leaves rustling in gentle breezes, streams babbling their liquid narratives. In this verdant sanctuary, time moves differently, measured by seasons and the slow growth of rings within aging timber."
  },
  {
    id: 6,
    name: "Desert",
    difficulty: "medium",
    context: "Endless expanses of golden sand stretch toward horizons shimmering with mirages. The desert sun beats down with relentless intensity, sculpting dunes into ever-shifting sculptures. Despite the harshness, life persists in remarkable forms: hardy plants storing precious water, creatures adapted to extreme temperatures. Silence is profound and complete, broken only by wind singing through canyons and across barren plains. The desert strips away pretense, revealing the essential nature of survival and beauty in sparse, minimalist landscapes of raw power."
  },
  {
    id: 7,
    name: "Mountain",
    difficulty: "hard",
    context: "Towering peaks pierce the sky, their snow-capped summits gleaming against azure heavens. Alpine meadows burst with wildflowers in brief summer abundance, a fleeting celebration of life at elevation. Air grows thin as you ascend, each breath a conscious act requiring focus and determination. Valleys far below seem impossibly distant, miniature worlds viewed from altitudes where clouds drift at eye level. Mountains teach perseverance, reward discipline, and humble those who underestimate their awesome power and timeless grandeur."
  }
];

/**
 * Get topic by index
 * @param {number} index - Topic index (0-7)
 * @returns {Object} Topic object or undefined
 */
export function getTopic(index) {
  return topics[index];
}

/**
 * Get all topics
 * @returns {Array} Array of all topics
 */
export function getAllTopics() {
  return topics;
}

/**
 * Get topic count
 * @returns {number} Total number of topics
 */
export function getTopicCount() {
  return topics.length;
}
