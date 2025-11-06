import { describe, it, expect } from 'vitest';
import { parseTimeToMinutes, minutesToHHMM, formatBankMinutes, diffMinutes } from '../time';

describe('time utils', () => {
  it('parseTimeToMinutes parses HH:MM correctly', () => {
    expect(parseTimeToMinutes('09:00')).toBe(9 * 60);
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('18:15')).toBe(18 * 60 + 15);
  });

  it('parseTimeToMinutes returns null for placeholders/invalid', () => {
    expect(parseTimeToMinutes('--:--')).toBeNull();
    expect(parseTimeToMinutes(undefined)).toBeNull();
    expect(parseTimeToMinutes('abc')).toBeNull();
  });

  it('minutesToHHMM formats minutes to HH:MM with sign for negative', () => {
    expect(minutesToHHMM(495)).toBe('08:15'); // 8h15
    expect(minutesToHHMM(0)).toBe('00:00');
    expect(minutesToHHMM(-15)).toBe('-00:15');
  });

  it('formatBankMinutes formats bank deltas with sign and minutes', () => {
    expect(formatBankMinutes(15)).toBe('+0:15');
    expect(formatBankMinutes(-90)).toBe('-1:30');
    expect(formatBankMinutes(480)).toBe('+8:00');
  });

  it('diffMinutes returns difference in minutes between two times', () => {
    expect(diffMinutes('09:00', '18:15')).toBe(9 * 60 + 15);
    expect(diffMinutes('08:30', '08:45')).toBe(15);
    expect(diffMinutes('09:00', undefined)).toBeNull();
  });
});
