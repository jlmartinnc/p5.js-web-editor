import i18next from 'i18next';
import dateUtils from './formatDate';

jest.mock('i18next', () => ({
  t: jest.fn()
}));

jest.mock('../i18n', () => ({
  // eslint-disable-next-line global-require
  currentDateLocale: () => require('date-fns/locale').enUS
}));

describe('dateUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('distanceInWordsToNow', () => {
    it('returns "JustNow" for dates within 10 seconds', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 5000);

      i18next.t.mockReturnValue('JustNow');

      const result = dateUtils.distanceInWordsToNow(recentDate);
      expect(i18next.t).toHaveBeenCalledWith('formatDate.JustNow');
      expect(result).toBe('JustNow');
    });

    it('returns "15Seconds" for dates ~15s ago', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 15000);

      i18next.t.mockReturnValue('15Seconds');

      const result = dateUtils.distanceInWordsToNow(recentDate);
      expect(i18next.t).toHaveBeenCalledWith('formatDate.15Seconds');
      expect(result).toBe('15Seconds');
    });

    it('returns formatted distance with "Ago" for dates over 46s', () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 60000);

      i18next.t.mockImplementation((key, { timeAgo }) => `${key}: ${timeAgo}`);

      const result = dateUtils.distanceInWordsToNow(oldDate);
      expect(i18next.t).toHaveBeenCalledWith(
        'formatDate.Ago',
        expect.any(Object)
      );
      expect(result).toContain('Ago');
    });

    it('returns empty string for invalid date', () => {
      const result = dateUtils.distanceInWordsToNow('not a date');
      expect(result).toBe('');
    });
  });

  describe('format', () => {
    it('formats with time by default', () => {
      const date = new Date('2025-07-16T12:34:56Z');
      const formatted = dateUtils.format(date);

      expect(formatted).toMatch(/(\d{1,2}:\d{2})/); // Contains time
    });

    it('formats without time when showTime is false', () => {
      const date = new Date('2025-07-16T12:34:56Z');
      const formatted = dateUtils.format(date, { showTime: false });

      expect(formatted).not.toMatch(/(\d{1,2}:\d{2})/); // Contains time
    });

    it('returns empty string for invalid date', () => {
      const formatted = dateUtils.format('invalid date');
      expect(formatted).toBe('');
    });
  });
});
