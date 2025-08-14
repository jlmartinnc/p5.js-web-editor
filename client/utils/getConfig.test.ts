import { getConfig } from './getConfig';

describe('utils/getConfig()', () => {
  beforeEach(() => {
    delete global.process.env.CONFIG_TEST_KEY_NAME;
    delete window.process.env.CONFIG_TEST_KEY_NAME;
  });

  // check for key
  it('throws if key is empty string', () => {
    expect(() => getConfig(/* key is empty string */ '')).toThrow(
      /must be provided/
    );
  });

  // check returns happy path
  it('fetches from global.process', () => {
    global.process.env.CONFIG_TEST_KEY_NAME = 'editor.p5js.org';

    expect(getConfig('CONFIG_TEST_KEY_NAME')).toBe('editor.p5js.org');
  });

  it('fetches from window.process', () => {
    window.process.env.CONFIG_TEST_KEY_NAME = 'editor.p5js.org';

    expect(getConfig('CONFIG_TEST_KEY_NAME')).toBe('editor.p5js.org');
  });

  // check returns unhappy path
  describe('and when the key does not exist in the env file', () => {
    it('warns but does not throw if throwErrorIfNotFound is false (default)', () => {
      expect(() => getConfig('CONFIG_TEST_KEY_NAME')).not.toThrow();
    });

    it('throws an error if throwErrorIfNotFound is true', () => {
      process.env.NODE_ENV = 'not_test';
      expect(() =>
        getConfig('CONFIG_TEST_KEY_NAME', {
          throwErrorIfNotFound: true,
          throwErrorInTestEnv: true
        })
      ).toThrow();
    });

    it('returns undefined by default', () => {
      const result = getConfig('CONFIG_TEST_KEY_NAME');
      expect(result).toBe(undefined);
      expect(!result).toBe(true);
      expect(`${result}`).toBe('undefined');
    });

    it('can be set to return an empty string as the nullish value', () => {
      const result = getConfig('CONFIG_TEST_KEY_NAME', { nullishString: true });
      expect(`${result}`).toBe('');
    });
  });

  describe('and when the key exists in the env file but the value is empty', () => {
    beforeEach(() => {
      global.process.env.CONFIG_TEST_KEY_NAME = '';
    });

    it('warns but does not throw if throwErrorIfNotFound is false (default)', () => {
      expect(() => getConfig('CONFIG_TEST_KEY_NAME')).not.toThrow();
    });

    it('throws an error if throwErrorIfNotFound is true', () => {
      expect(() =>
        getConfig('CONFIG_TEST_KEY_NAME', {
          throwErrorIfNotFound: true,
          throwErrorInTestEnv: true
        })
      ).toThrow();
    });

    it('returns undefined by default', () => {
      const result = getConfig('CONFIG_TEST_KEY_NAME');
      expect(result).toBe(undefined);
      expect(!result).toBe(true);
      expect(`${result}`).toBe('undefined');
    });

    it('can be set to return an empty string as the nullish value', () => {
      const result = getConfig('CONFIG_TEST_KEY_NAME', { nullishString: true });
      expect(`${result}`).toBe('');
    });
  });
});
