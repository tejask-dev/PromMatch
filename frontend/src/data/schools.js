/**
 * Windsor-Essex County high schools
 * Restricted to these schools only — students outside this region cannot register.
 */

export const WINDSOR_ESSEX_SCHOOLS = [
  // Windsor — GECDSB (Public)
  { name: 'Walkerville Secondary School', city: 'Windsor', board: 'GECDSB' },
  { name: 'W.D. Lowe Secondary School', city: 'Windsor', board: 'GECDSB' },
  { name: 'Kennedy Collegiate Institute', city: 'Windsor', board: 'GECDSB' },
  { name: 'Herman Secondary School', city: 'Windsor', board: 'GECDSB' },
  { name: 'Riverside Secondary School', city: 'Windsor', board: 'GECDSB' },
  { name: 'Sandwich Secondary School', city: 'Windsor', board: 'GECDSB' },
  { name: 'Westview Freedom Academy', city: 'Windsor', board: 'GECDSB' },

  // Windsor — WECDSB (Catholic)
  { name: 'Assumption College School', city: 'Windsor', board: 'WECDSB' },
  { name: 'F.J. Brennan Catholic High School', city: 'Windsor', board: 'WECDSB' },
  { name: 'Holy Names Catholic High School', city: 'Windsor', board: 'WECDSB' },
  { name: 'St. Joseph\'s Catholic High School', city: 'Windsor', board: 'WECDSB' },
  { name: 'Lajeunesse Secondary School', city: 'Windsor', board: 'WECDSB' },

  // Windsor — French boards
  { name: 'Académie La Citadelle', city: 'Windsor', board: 'Viamonde' },

  // Tecumseh / Lakeshore — GECDSB
  { name: 'Belle River District High School', city: 'Lakeshore', board: 'GECDSB' },

  // Tecumseh / Lakeshore — WECDSB / French Catholic
  { name: 'St. Anne Catholic High School', city: 'Tecumseh', board: 'WECDSB' },
  { name: 'École secondaire catholique L\'Essor', city: 'Tecumseh', board: 'Providence' },

  // Essex — GECDSB
  { name: 'Essex District High School', city: 'Essex', board: 'GECDSB' },

  // Amherstburg — GECDSB
  { name: 'General Amherst High School', city: 'Amherstburg', board: 'GECDSB' },

  // Kingsville — GECDSB
  { name: 'Kingsville District High School', city: 'Kingsville', board: 'GECDSB' },

  // Harrow — GECDSB
  { name: 'Harrow Secondary School', city: 'Harrow', board: 'GECDSB' },

  // Leamington — GECDSB
  { name: 'Leamington District Secondary School', city: 'Leamington', board: 'GECDSB' },

  // Leamington — WECDSB (Catholic)
  { name: 'Cardinal Carter Catholic Secondary School', city: 'Leamington', board: 'WECDSB' },
];

export const SCHOOL_NAMES = WINDSOR_ESSEX_SCHOOLS.map((s) => s.name);

export function isValidWindsorEssexSchool(name) {
  return SCHOOL_NAMES.some((s) => s.toLowerCase() === name.toLowerCase());
}
