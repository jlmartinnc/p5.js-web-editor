// Inspired by
// https://github.com/codesandbox/codesandbox-client/blob/master/packages/codesandbox-api/src/dispatcher/index.ts

const frames: {
  [key: number]: { frame: Window | null, origin: string }
} = {};
let frameIndex = 1;

export const MessageTypes = {
  START: 'START',
  STOP: 'STOP',
  FILES: 'FILES',
  SKETCH: 'SKETCH',
  REGISTER: 'REGISTER',
  EXECUTE: 'EXECUTE',
  // eslint-disable-next-line prettier/prettier
} as const;

export type MessageType = typeof MessageTypes[keyof typeof MessageTypes];

export type Message = {
  type: MessageType,
  payload?: any
};

let listener: ((message: Message) => void) | null = null;

export function registerFrame(
  newFrame: Window | null,
  newOrigin: string | null | undefined
): () => void {
  const frameId = frameIndex;
  frameIndex += 1;
  frames[frameId] = { frame: newFrame, origin: newOrigin ?? '' };
  return () => {
    delete frames[frameId];
  };
}

function notifyListener(message: Message): void {
  if (listener) listener(message);
}

function notifyFrames(message: Message) {
  const rawMessage = JSON.parse(JSON.stringify(message));
  Object.values(frames).forEach((frameObj) => {
    const { frame, origin } = frameObj
    if (frame && frame.postMessage) {
      frame.postMessage(rawMessage, origin);
    }
  });
}

export function dispatchMessage(message: Message | undefined | null): void {
  if (!message) return;

  // maybe one day i will understand why in the codesandbox
  // code they leave notifyListeners in here?
  // notifyListener(message);
  notifyFrames(message);
}

/**
 * Call callback to remove listener
 */
export function listen(callback: (message: Message) => void): () => void {
  listener = callback;
  return () => {
    listener = null;
  };
}

function eventListener(e: MessageEvent) {
  const { data } = e;

  // should also store origin of parent? idk
  // if (data && e.origin === origin) {
  if (data) {
    notifyListener(data);
  }
}

window.addEventListener('message', eventListener);
