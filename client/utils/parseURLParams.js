import { p5Versions, currentP5Version } from "../../common/p5Versions";

// One centralized parser
export function parseUrlParams(url) {
  const params = new URLSearchParams(new URL(url, 'https://dummy.origin').search);

  return {
    version: validateVersion(params.get('version')), // string
    sound: validateSound(params.get('sound')), // bool
    preload: validatePreload(params.get('preload')), // bool
    shapes: validateShapes(params.get('shapes')), // bool
    data: validateData(params.get('data')) // bool
    // Easy to add more params here
  };
}

function validateVersion(version) {
    if (!version) {
        return currentP5Version;
    }

    // if valid return version

    return currentP5Version;
}
function validateSound(sound) {
    return;

    // on, true, 1 == on
    // off, false, 0 == off

    // default if none triggered

}
function validatePreload(preload) {
    return;

    // on, true, 1 == on
    // off, false, 0 == off
    
    // default if none triggered

}
function validateShapes(shapes) {
    return;

    // on, true, 1 == on
    // off, false, 0 == off
    
    // default if none triggered


}
function validateData(data) {
    return;

    // on, true, 1 == on
    // off, false, 0 == off
    
    // default if none triggered

}