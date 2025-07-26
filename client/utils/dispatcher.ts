// Inspired by
// https://github.com/codesandbox/codesandbox-client/blob/master/packages/codesandbox-api/src/dispatcher/index.ts

const frames: {
  [key: number]: { frame: Window | null, origin: string }
} = {};
let frameIndex = 1;

/** Codesandbox dispatcher message types */
export const MessageTypes = {
  START: 'START',
  STOP: 'STOP',
  FILES: 'FILES',
  SKETCH: 'SKETCH',
  REGISTER: 'REGISTER',
  EXECUTE: 'EXECUTE',
  // eslint-disable-next-line prettier/prettier
} as const;

/** Codesandbox dispatcher message types */
export type MessageType = typeof MessageTypes[keyof typeof MessageTypes];

/**
 * Codesandbox dispatcher message
 *   - type: 'START', 'STOP' etc
 *   - payload: additional data for that message type
 */
export type Message = {
  type: MessageType,
  payload?: any
};

let listener: ((message: Message) => void) | null = null;

/**
 * Registers a frame to receive future dispatched messages.
 * @param newFrame - The Window object of the frame to register.
 * @param newOrigin - The expected origin to use when posting messages to this frame. If this is nullish, it will be registered as ''
 * @returns A cleanup function that unregisters the frame.
 */
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

/** Notify the currently registered listener with a `message` */
function notifyListener(message: Message): void {
  if (listener) listener(message);
}

/** Notify each registered frame with a `message` */
function notifyFrames(message: Message) {
  const rawMessage = JSON.parse(JSON.stringify(message));
  Object.values(frames).forEach((frameObj) => {
    const { frame, origin } = frameObj
    if (frame && frame.postMessage) {
      frame.postMessage(rawMessage, origin);
    }
  });
}

/**
 * Sends a message to all registered frames.
 * @param message - The message to dispatch.
 */
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

/** Forwards a `MessageEvent` to the registered event listener */
function eventListener(e: MessageEvent) {
  const { data } = e;

  // should also store origin of parent? idk
  // if (data && e.origin === origin) {
  if (data) {
    notifyListener(data);
  }
}

window.addEventListener('message', eventListener);
