/**
 * Game Tab Configuration
 * Defines tabs and their corresponding API parameters
 */

export interface GameTab {
  id: string;
  title: string;
  types?: string[];
  description: string;
}

export const GAME_TABS: GameTab[] = [
  {
    id: 'bonus',
    title: 'Bonus Games',
    types: ['bonus'],
    description: 'Games with special bonus features',
  },
    {
    id: 'exclusive',
    title: 'Exclusive Games',
    types: ['exclusive'],
    description: 'Platform exclusive games',
  },
  {
    id: 'signature',
    title: 'Signature Games',
    types: ['signature'],
    description: 'Platform signature games',
  },

  // {
  //   id: 'new_releases',
  //   title: 'New Releases',
  //   types: ['new_releases'],
  //   description: 'Latest game releases',
  // },
  // {
  //   id: 'slots',
  //   title: 'Slots',
  //   types: ['slots'],
  //   description: 'Slot machine games',
  // },
  // {
  //   id: 'fish',
  //   title: 'Fish Games',
  //   types: ['fish'],
  //   description: 'Fishing games',
  // },
  {
    id: 'all',
    title: 'All Games',
    description: 'Complete game collection',
  },
];

export const DEFAULT_TAB = GAME_TABS[0]; // Bonus Games
