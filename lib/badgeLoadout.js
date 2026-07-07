import { calculateFighterBadges } from "./badgeEngine";

export const MAX_ACTIVE_BADGES = 4;

/**
 * Auto-selects up to 4 badges for a fighter, prioritizing highest tier
 * first (Gold > Silver > Bronze), which is a reasonable default whether
 * used by a human's "Auto Select" button or an unattended CPU/community
 * opponent that never went through the loadout screen.
 */
export function autoSelectBadges(fighter) {
  const earned = calculateFighterBadges(fighter, fighter.power_point_cost, fighter.power_point_cap);
  return earned.slice(0, MAX_ACTIVE_BADGES).map((b) => b.name);
}

/** Returns the fighter's active badge list, auto-selecting if none were chosen. */
export function resolveActiveBadges(fighter) {
  if (Array.isArray(fighter.active_badges) && fighter.active_badges.length > 0) {
    return fighter.active_badges.slice(0, MAX_ACTIVE_BADGES);
  }
  return autoSelectBadges(fighter);
}

/** Attaches an active_badges array onto a fighter snapshot (shallow copy, non-mutating). */
export function withActiveBadges(fighter, activeBadgeNames) {
  return { ...fighter, active_badges: (activeBadgeNames || []).slice(0, MAX_ACTIVE_BADGES) };
}
