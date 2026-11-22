// Tarot data — 22 Major Arcana with upright/reversed meanings.
// Minor Arcana (56) are generated in the engine from suit + rank meanings.
export interface TarotCard { id: string; name: string; arcana: 'Major' | 'Minor'; suit?: string; rank?: string; upright: string; reversed: string }
export const MAJOR_ARCANA: TarotCard[] = [
  { id: 'major-0', name: 'The Fool', arcana: 'Major', upright: 'New beginnings, innocence, a leap of faith.', reversed: 'Recklessness, fear of starting, poor judgement.' },
  { id: 'major-1', name: 'The Magician', arcana: 'Major', upright: 'Skill, willpower, turning ideas into reality.', reversed: 'Manipulation, untapped talent, wasted energy.' },
  { id: 'major-2', name: 'The High Priestess', arcana: 'Major', upright: 'Intuition, hidden knowledge, trust your inner voice.', reversed: 'Ignoring intuition, secrets, confusion.' },
  { id: 'major-3', name: 'The Empress', arcana: 'Major', upright: 'Abundance, nurture, creativity and growth.', reversed: 'Dependence, creative block, neglect.' },
  { id: 'major-4', name: 'The Emperor', arcana: 'Major', upright: 'Authority, structure, stability and control.', reversed: 'Rigidity, misuse of power, lack of discipline.' },
  { id: 'major-5', name: 'The Hierophant', arcana: 'Major', upright: 'Tradition, guidance, learning from a teacher.', reversed: 'Breaking rules, unconventional path, questioning beliefs.' },
  { id: 'major-6', name: 'The Lovers', arcana: 'Major', upright: 'Love, harmony, a meaningful choice.', reversed: 'Disharmony, difficult choice, imbalance.' },
  { id: 'major-7', name: 'The Chariot', arcana: 'Major', upright: 'Determination, victory through focus and will.', reversed: 'Loss of direction, scattered effort.' },
  { id: 'major-8', name: 'Strength', arcana: 'Major', upright: 'Courage, patience, gentle power over challenges.', reversed: 'Self-doubt, weakness, loss of confidence.' },
  { id: 'major-9', name: 'The Hermit', arcana: 'Major', upright: 'Solitude, reflection, searching within for answers.', reversed: 'Isolation, loneliness, refusing guidance.' },
  { id: 'major-10', name: 'Wheel of Fortune', arcana: 'Major', upright: 'Change, cycles, a turn of luck.', reversed: 'Bad luck, resisting change, delays.' },
  { id: 'major-11', name: 'Justice', arcana: 'Major', upright: 'Fairness, truth, cause and effect.', reversed: 'Unfairness, dishonesty, avoiding responsibility.' },
  { id: 'major-12', name: 'The Hanged Man', arcana: 'Major', upright: 'Pause, new perspective, surrender to timing.', reversed: 'Stalling, pointless sacrifice, impatience.' },
  { id: 'major-13', name: 'Death', arcana: 'Major', upright: 'Endings and transformation — one chapter closes so another opens.', reversed: 'Fear of change, clinging to the past.' },
  { id: 'major-14', name: 'Temperance', arcana: 'Major', upright: 'Balance, patience, moderation, healing.', reversed: 'Excess, imbalance, impatience.' },
  { id: 'major-15', name: 'The Devil', arcana: 'Major', upright: 'Attachment, temptation, feeling trapped by habit.', reversed: 'Breaking free, release, regaining control.' },
  { id: 'major-16', name: 'The Tower', arcana: 'Major', upright: 'Sudden change, a structure falls so truth can stand.', reversed: 'Avoiding a needed change, delayed upheaval.' },
  { id: 'major-17', name: 'The Star', arcana: 'Major', upright: 'Hope, healing, guidance after difficulty.', reversed: 'Loss of hope, discouragement, feeling lost.' },
  { id: 'major-18', name: 'The Moon', arcana: 'Major', upright: 'Illusion, dreams, uncertainty — look carefully.', reversed: 'Clarity returning, fears easing.' },
  { id: 'major-19', name: 'The Sun', arcana: 'Major', upright: 'Joy, success, vitality and clarity.', reversed: 'Temporary cloud, delayed joy.' },
  { id: 'major-20', name: 'Judgement', arcana: 'Major', upright: 'Awakening, a call to a new purpose, renewal.', reversed: 'Self-judgement, refusing a calling.' },
  { id: 'major-21', name: 'The World', arcana: 'Major', upright: 'Completion, fulfilment, a cycle well finished.', reversed: 'Incompletion, a final step still pending.' },
];
