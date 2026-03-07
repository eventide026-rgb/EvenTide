
/**
 * @fileOverview EvenTide Marketplace Matching Engine
 * Core logic for scoring and matching vendors to events.
 */

import { type Vendor } from './types';

export type MatchingCriteria = {
  city: string;
  budget: number;
  guestCount: number;
  style?: string;
};

export type ScoredVendor = {
  vendor: Vendor;
  score: number;
  matchReasons: string[];
};

/**
 * Calculates a match score (0-100) for a vendor against specific event criteria.
 */
export function scoreVendor(vendor: any, criteria: MatchingCriteria): ScoredVendor {
  let score = 0;
  const reasons: string[] = [];

  // 1. Location Match (40 points)
  if (vendor.city?.toLowerCase() === criteria.city.toLowerCase()) {
    score += 40;
    reasons.push('Located in your city');
  } else if (vendor.state === vendor.state) {
    score += 15;
    reasons.push('Available in your state');
  }

  // 2. Budget Match (30 points)
  // Assuming vendor has priceRangeMin and priceRangeMax
  const vMin = vendor.priceRangeMin || 0;
  const vMax = vendor.priceRangeMax || Infinity;
  
  if (criteria.budget >= vMin && criteria.budget <= vMax) {
    score += 30;
    reasons.push('Fits your budget perfectly');
  } else if (criteria.budget >= vMin) {
    score += 20;
    reasons.push('Great value for your budget');
  }

  // 3. Rating & Reputation (20 points)
  const rating = vendor.rating || 4.0;
  score += (rating / 5) * 20;
  if (rating >= 4.5) {
    reasons.push('Highly rated professional');
  }

  // 4. Style/Specialty Match (10 points)
  if (criteria.style && vendor.specialties?.includes(criteria.style)) {
    score += 10;
    reasons.push(`Expert in ${criteria.style} style`);
  }

  return {
    vendor,
    score: Math.min(Math.round(score), 100),
    matchReasons: reasons,
  };
}

/**
 * Returns top matches grouped by specialty.
 */
export function getRecommendedVendors(vendors: any[], criteria: MatchingCriteria, limitPerCategory = 3) {
  const scored = vendors.map(v => scoreVendor(v, criteria));
  const sorted = scored.sort((a, b) => b.score - a.score);

  // Group by specialty
  const grouped: Record<string, ScoredVendor[]> = {};
  sorted.forEach(item => {
    const cat = item.vendor.specialty;
    if (!grouped[cat]) grouped[cat] = [];
    if (grouped[cat].length < limitPerCategory) {
      grouped[cat].push(item);
    }
  });

  return grouped;
}
