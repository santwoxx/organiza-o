// Helpers for daily recurring demands (cartões que precisam ser refeitos todos os dias)

export const toDateStr = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const isDoneToday = (lastCompletedDate?: string): boolean => {
  return !!lastCompletedDate && lastCompletedDate === toDateStr();
};

// Sequência atual de dias consecutivos concluídos. Se hoje ainda não foi feito,
// a sequência de ontem para trás continua valendo (o dia não "quebra" até acabar).
export const getStreak = (completedDates: string[] = []): number => {
  const set = new Set(completedDates);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!set.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (set.has(toDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
