import { p5Versions, currentP5Version } from '../../common/p5Versions';

const DEFAULTS = {
  sound: true,
  preload: false,
  shapes: false,
  data: false
};

// One centralized parser
export function parseUrlParams(url) {
  const params = new URLSearchParams(
    new URL(url, 'https://dummy.origin').search
  );

  return {
    version: validateVersion(params.get('version')), // string
    sound: validateBool(params.get('sound'), DEFAULTS.sound), // bool
    preload: validateBool(params.get('preload'), DEFAULTS.preload), // bool
    shapes: validateBool(params.get('shapes'), DEFAULTS.shapes), // bool
    data: validateBool(params.get('data'), DEFAULTS.data) // bool
    // Easy to add more params here
  };
}

function validateVersion(version) {
  if (!version) {
    return currentP5Version;
  }
  const v = String(version).trim();
  if (v.toLowerCase() === 'latest') {
    const newest = getNewestVersion(p5Versions);
    return newest ?? currentP5Version; //The ?? operator means: “if newest is null or undefined, use currentP5Version
  }
  if (v.toLowerCase() === 'current') return currentP5Version;
  if (p5Versions.includes(v)) return v;
  const normalized = v.replace(/^v/i, '');
  if (p5Versions.includes(normalized)) return normalized;
  //This line strips that leading v using a regular expression ^v (meaning “v at the start”) and then rechecks.

  // if valid return version
  return currentP5Version;
}

//picks highest version number from array
function getNewestVersion(list) {
  // Defensive copy + semver sort (major.minor.patch)
  const parts = (s) => s.split('.').map((n) => parseInt(n, 10) || 0);
  return [...list].sort((a, b) => {
    const [am, an, ap] = parts(a);
    const [bm, bn, bp] = parts(b);
    if (am !== bm) return bm - am;
    if (an !== bn) return bn - an;
    return bp - ap;
  })[0];
}

function validateBool(value, defaultValue) {
  if (value) return defaultValue; // param absent
  //if (value === '') return true; // bare flag: ?flag

  const v = String(value).trim().toLowerCase();

  const TRUTHY = new Set(['on', 'true', '1', 'yes', 'y', 'enable', 'enabled']);
  const FALSY = new Set([
    'off',
    'false',
    '0',
    //'no',
    //'n',
    //'disable',
    //'disabled'
  ]);

  if (TRUTHY.has(v)) return true;
  if (FALSY.has(v)) return false;

  return defaultValue; // unrecognized → fall back safely
}

