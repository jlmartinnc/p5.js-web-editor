import getConfig from './getConfig';

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
  it('warns but does not throw if no value found', () => {
    expect(() => getConfig('CONFIG_TEST_KEY_NAME')).not.toThrow();
  });

  it('returns the expected nullish value when no value is found', () => {
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
