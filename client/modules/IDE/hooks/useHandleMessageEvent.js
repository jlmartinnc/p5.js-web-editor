import { useDispatch } from 'react-redux';
import { Decode } from 'console-feed';
import { dispatchConsoleEvent } from '../actions/console';
import { stopSketch, expandConsole } from '../actions/ide';

export default function useHandleMessageEvent() {
  const dispatch = useDispatch();

  // Function to safely convert objects to strings (handles circular references)
  const safeStringify = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular Reference]';
        seen.add(value);
      }
      return value;
    });
  };

  const handleMessageEvent = (data) => {
    if (!data || typeof data !== 'object') return;
    const { source, messages } = data;
    if (source !== 'sketch' || !Array.isArray(messages)) return;
    const decodedMessages = messages.map((message) => {
      try {
        return JSON.parse(safeStringify(Decode(message.log)));
      } catch (error) {
        console.error('Error decoding message:', error);
        return { error: 'Failed to decode message' };
      }
    });

    const hasInfiniteLoop = decodedMessages.some(
      (message) =>
        message?.data &&
        Object.values(message.data).some(
          (arg) =>
            typeof arg === 'string' &&
            arg.includes('Exiting potential infinite loop')
        )
    );

    if (hasInfiniteLoop) {
      dispatch(stopSketch());
      dispatch(expandConsole());
      return;
    }

    dispatch(dispatchConsoleEvent(decodedMessages));
  };

  return handleMessageEvent;
}
