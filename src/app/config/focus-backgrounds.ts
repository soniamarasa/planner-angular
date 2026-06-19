export interface FocusBackground {
  id: string;
  name: string;
  imageUrl: string;
  /** Photo credit — fill in before publishing (e.g. "Photo by Name on Unsplash"). */
  credit: string;
}

export const DEFAULT_FOCUS_BACKGROUND_ID = 'forest';

export const FOCUS_BACKGROUNDS: FocusBackground[] = [
  {
    id: 'beach',
    name: 'Beach',
    imageUrl: 'assets/backgrounds/beach.jpg',
    credit: '',
  },
  {
    id: 'city',
    name: 'City',
    imageUrl: 'assets/backgrounds/city.jpg',
    credit: '',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    imageUrl: 'assets/backgrounds/coffee.jpg',
    credit: '',
  },
  {
    id: 'flowers',
    name: 'Flowers',
    imageUrl: 'assets/backgrounds/flowers.jpg',
    credit: '',
  },
  {
    id: 'forest',
    name: 'Forest',
    imageUrl: 'assets/backgrounds/forest.jpg',
    credit: '',
  },
  {
    id: 'forest-1',
    name: 'Forest I',
    imageUrl: 'assets/backgrounds/forest-1.jpg',
    credit: '',
  },
  {
    id: 'forest-2',
    name: 'Forest II',
    imageUrl: 'assets/backgrounds/forest-2.jpg',
    credit: '',
  },
  {
    id: 'montain',
    name: 'Mountain',
    imageUrl: 'assets/backgrounds/montain.jpg',
    credit: '',
  },
  {
    id: 'moon',
    name: 'Moon',
    imageUrl: 'assets/backgrounds/moon.jpg',
    credit: '',
  },
];

export function getFocusBackgroundById(backgroundId?: string | null): FocusBackground {
  return (
    FOCUS_BACKGROUNDS.find((background) => background.id === backgroundId) ??
    FOCUS_BACKGROUNDS.find((background) => background.id === DEFAULT_FOCUS_BACKGROUND_ID) ??
    FOCUS_BACKGROUNDS[0]
  );
}
