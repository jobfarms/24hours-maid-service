/**
 * Hierarchical location data for India
 * Used for dynamic page generation, routing, and lead capture
 */

export interface Area {
  id: string;
  name: string;
  slug: string;
  zipCodes?: string[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  areas: Area[];
  population?: string;
  description?: string;
}

export interface State {
  id: string;
  name: string;
  slug: string;
  cities: City[];
  code: string;
}

// High-priority states and cities for initial rollout
export const PRIORITY_STATES = [
  'maharashtra',
  'karnataka',
  'tamil-nadu',
  'telangana',
  'delhi',
  'uttar-pradesh',
  'west-bengal',
  'punjab',
  'rajasthan',
  'gujarat',
];

// Comprehensive Indian states with major cities and areas
export const LOCATIONS: State[] = [
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    slug: 'maharashtra',
    code: 'MH',
    cities: [
      {
        id: 'mumbai',
        name: 'Mumbai',
        slug: 'mumbai',
        state: 'maharashtra',
        population: '20.9M',
        description: 'Financial capital of India with highest demand for domestic services',
        areas: [
          { id: 'andheri', name: 'Andheri', slug: 'andheri', zipCodes: ['400069', '400070'] },
          { id: 'bandra', name: 'Bandra', slug: 'bandra', zipCodes: ['400050'] },
          { id: 'dadar', name: 'Dadar', slug: 'dadar', zipCodes: ['400014'] },
          { id: 'colaba', name: 'Colaba', slug: 'colaba', zipCodes: ['400039'] },
          { id: 'powai', name: 'Powai', slug: 'powai', zipCodes: ['400076'] },
          { id: 'thane', name: 'Thane', slug: 'thane', zipCodes: ['400601'] },
          { id: 'navi-mumbai', name: 'Navi Mumbai', slug: 'navi-mumbai', zipCodes: ['400705'] },
        ],
      },
      {
        id: 'pune',
        name: 'Pune',
        slug: 'pune',
        state: 'maharashtra',
        population: '6.4M',
        description: 'IT hub with growing demand for professional domestic help',
        areas: [
          { id: 'koregaon-park', name: 'Koregaon Park', slug: 'koregaon-park', zipCodes: ['411001'] },
          { id: 'viman-nagar', name: 'Viman Nagar', slug: 'viman-nagar', zipCodes: ['411014'] },
          { id: 'hadapsar', name: 'Hadapsar', slug: 'hadapsar', zipCodes: ['411013'] },
          { id: 'hinjewadi', name: 'Hinjewadi', slug: 'hinjewadi', zipCodes: ['411057'] },
        ],
      },
      {
        id: 'nagpur',
        name: 'Nagpur',
        slug: 'nagpur',
        state: 'maharashtra',
        areas: [
          { id: 'sitabuldi', name: 'Sitabuldi', slug: 'sitabuldi' },
          { id: 'dharampeth', name: 'Dharampeth', slug: 'dharampeth' },
        ],
      },
    ],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    slug: 'karnataka',
    code: 'KA',
    cities: [
      {
        id: 'bangalore',
        name: 'Bangalore',
        slug: 'bangalore',
        state: 'karnataka',
        population: '8.4M',
        description: 'India\'s tech capital with high demand for household services',
        areas: [
          { id: 'indiranagar', name: 'Indiranagar', slug: 'indiranagar', zipCodes: ['560038'] },
          { id: 'koramangala', name: 'Koramangala', slug: 'koramangala', zipCodes: ['560034'] },
          { id: 'whitefield', name: 'Whitefield', slug: 'whitefield', zipCodes: ['560066'] },
          { id: 'jp-nagar', name: 'JP Nagar', slug: 'jp-nagar', zipCodes: ['560078'] },
          { id: 'marathahalli', name: 'Marathahalli', slug: 'marathahalli', zipCodes: ['560037'] },
        ],
      },
      {
        id: 'mysore',
        name: 'Mysore',
        slug: 'mysore',
        state: 'karnataka',
        areas: [
          { id: 'vijayanagar', name: 'Vijayanagar', slug: 'vijayanagar' },
          { id: 'gokulam', name: 'Gokulam', slug: 'gokulam' },
        ],
      },
    ],
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    slug: 'tamil-nadu',
    code: 'TN',
    cities: [
      {
        id: 'chennai',
        name: 'Chennai',
        slug: 'chennai',
        state: 'tamil-nadu',
        population: '7.1M',
        description: 'Major metro with strong service sector demand',
        areas: [
          { id: 't-nagar', name: 'T. Nagar', slug: 't-nagar', zipCodes: ['600017'] },
          { id: 'anna-nagar', name: 'Anna Nagar', slug: 'anna-nagar', zipCodes: ['600040'] },
          { id: 'velachery', name: 'Velachery', slug: 'velachery', zipCodes: ['600042'] },
          { id: 'adyar', name: 'Adyar', slug: 'adyar', zipCodes: ['600020'] },
        ],
      },
    ],
  },
  {
    id: 'telangana',
    name: 'Telangana',
    slug: 'telangana',
    code: 'TG',
    cities: [
      {
        id: 'hyderabad',
        name: 'Hyderabad',
        slug: 'hyderabad',
        state: 'telangana',
        population: '6.8M',
        description: 'Growing tech hub with increasing service demand',
        areas: [
          { id: 'banjara-hills', name: 'Banjara Hills', slug: 'banjara-hills', zipCodes: ['500034'] },
          { id: 'jubilee-hills', name: 'Jubilee Hills', slug: 'jubilee-hills', zipCodes: ['500033'] },
          { id: 'hitech-city', name: 'Hi-Tech City', slug: 'hitech-city', zipCodes: ['500081'] },
        ],
      },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    slug: 'delhi',
    code: 'DL',
    cities: [
      {
        id: 'new-delhi',
        name: 'New Delhi',
        slug: 'new-delhi',
        state: 'delhi',
        population: '16.7M',
        description: 'Capital city with premium service requirements',
        areas: [
          { id: 'south-delhi', name: 'South Delhi', slug: 'south-delhi', zipCodes: ['110021'] },
          { id: 'east-delhi', name: 'East Delhi', slug: 'east-delhi', zipCodes: ['110091'] },
          { id: 'west-delhi', name: 'West Delhi', slug: 'west-delhi', zipCodes: ['110015'] },
          { id: 'north-delhi', name: 'North Delhi', slug: 'north-delhi', zipCodes: ['110006'] },
        ],
      },
    ],
  },
];

/**
 * Get all states
 */
export function getAllStates(): State[] {
  return LOCATIONS;
}

/**
 * Get state by slug
 */
export function getStateBySlug(slug: string): State | undefined {
  return LOCATIONS.find((s) => s.slug === slug);
}

/**
 * Get city by state and city slug
 */
export function getCityBySlug(stateSlug: string, citySlug: string): City | undefined {
  const state = getStateBySlug(stateSlug);
  return state?.cities.find((c) => c.slug === citySlug);
}

/**
 * Get area by state, city, and area slug
 */
export function getAreaBySlug(
  stateSlug: string,
  citySlug: string,
  areaSlug: string
): Area | undefined {
  const city = getCityBySlug(stateSlug, citySlug);
  return city?.areas.find((a) => a.slug === areaSlug);
}

/**
 * Generate sitemap entries for all locations
 */
export function generateLocationSitemapEntries(): Array<{
  url: string;
  priority: number;
  changefreq: string;
}> {
  const entries: Array<{ url: string; priority: number; changefreq: string }> = [];

  LOCATIONS.forEach((state) => {
    // State level
    entries.push({
      url: `/locations/${state.slug}`,
      priority: 0.8,
      changefreq: 'monthly',
    });

    // City level
    state.cities.forEach((city) => {
      entries.push({
        url: `/locations/${state.slug}/${city.slug}`,
        priority: 0.7,
        changefreq: 'monthly',
      });

      // Area level (lower priority for selective indexing)
      city.areas.forEach((area) => {
        entries.push({
          url: `/locations/${state.slug}/${city.slug}/${area.slug}`,
          priority: 0.5,
          changefreq: 'monthly',
        });
      });
    });
  });

  return entries;
}

/**
 * Get breadcrumb data for location pages
 */
export function getLocationBreadcrumbs(
  stateSlug: string,
  citySlug?: string,
  areaSlug?: string
): Array<{ name: string; url: string }> {
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
  ];

  const state = getStateBySlug(stateSlug);
  if (state) {
    breadcrumbs.push({
      name: `Services in ${state.name}`,
      url: `/locations/${state.slug}`,
    });

    if (citySlug) {
      const city = getCityBySlug(stateSlug, citySlug);
      if (city) {
        breadcrumbs.push({
          name: `Services in ${city.name}`,
          url: `/locations/${state.slug}/${city.slug}`,
        });

        if (areaSlug) {
          const area = getAreaBySlug(stateSlug, citySlug, areaSlug);
          if (area) {
            breadcrumbs.push({
              name: `Services in ${area.name}`,
              url: `/locations/${state.slug}/${city.slug}/${area.slug}`,
            });
          }
        }
      }
    }
  }

  return breadcrumbs;
}
