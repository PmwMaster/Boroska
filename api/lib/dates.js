export function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function computeStreak(isoDates, maxDays = 365) {
  const keys = new Set((isoDates || []).map(iso => dayKey(new Date(iso))));
  let streak = 0;
  const cursor = new Date();
  if (!keys.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (keys.has(dayKey(cursor)) && streak < maxDays) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
