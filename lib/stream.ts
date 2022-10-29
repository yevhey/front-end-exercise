import { useEffect, useRef, useState } from 'react';

// How often the connection will check its status and attempt reconnection
const CHECK_TIME = 1000; // milliseconds

enum Endpoint {
  pose   = 'pose',
  paused = 'paused',
}

export interface PosePayload {
  x: number;
  y: number;
  angle: number;
}

export interface PausedPayload {
  paused: boolean;
}

type IncomingPayload<E> =
  E extends Endpoint.pose ? PosePayload :
  E extends Endpoint.paused ? PausedPayload :
  never;

type OutgoingPayload<E> =
  E extends Endpoint.pose ? PosePayload :
  E extends Endpoint.paused ? PausedPayload :
  never;

// Return the URL for a specified endpoint.
const url = (endpoint: Endpoint) => {
  return `ws://${ window.location.host }/api/${ endpoint }`;
};

// The underlying Stream object takes an endpoint and returns an API stream
// which will keep itself connected until explicitly closed.
export class Stream<P extends IncomingPayload<Endpoint>, Q extends OutgoingPayload<Endpoint>> {
  private url: string;
  private socket?: WebSocket;
  private checkTimer: number;

  private messageCallbacks: ((payload: P) => void)[] = [];
  private openCallbacks: (() => void)[] = [];
  private closeCallbacks: (() => void)[] = [];

  constructor(endpoint: Endpoint) {
    this.url = url(endpoint);
    this.connect();
    this.checkTimer = window.setInterval(this.checkConnection, CHECK_TIME);
  }

  // Close the stream explicitly. No more messages will be sent or received.
  public close() {
    window.clearInterval(this.checkTimer);
    this.closeSocket();
  }

  // Send a new message on this stream.
  public send = (payload: Q) => {
    try {
      this.socket?.send(JSON.stringify(payload));
    } catch (e) {
      throw new Error(`Error sending message: ${ (e as Error).message }`);
    }
  };

  // Return the current connection status of this stream.
  public get connected() {
    return !!(this.socket && this.socket.readyState === WebSocket.OPEN);
  }

  // Register a 'new message' callback
  public onMessage = (callback: (payload: P) => void) => {
    this.messageCallbacks.push(callback);
  };

  // Remove a 'new message' callback
  public offMessage = (callback: (payload: P) => void) => {
    this.messageCallbacks = this.messageCallbacks.filter((cb) => callback !== cb);
  };

  // Register an 'open' callback
  public onOpen = (callback: () => void) => {
    this.openCallbacks.push(callback);
  };

  // Remove an 'open' callback
  public offOpen = (callback: () => void) => {
    this.openCallbacks = this.openCallbacks.filter((cb) => callback !== cb);
  };

  // Register a 'close' callback
  public onClose = (callback: () => void) => {
    this.closeCallbacks.push(callback);
  };

  // Remove a 'close' callback
  public offClose = (callback: () => void) => {
    this.closeCallbacks = this.closeCallbacks.filter((cb) => callback !== cb);
  };

  // Check if the socket is connected and establish a connection if not.
  private checkConnection = () => {
    if (this.connected) return;
    if (!this.socket) this.connect();
  };

  // Connect to the socket.
  private connect = () => {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = this.handleMessage;
    this.socket.onopen = this.handleOpen;
    this.socket.onclose = this.handleClose;
    this.socket.onerror = this.handleError;
  };

  // Close the socket.
  private closeSocket = () => {
    this.socket?.close(1000); // Normal close
    this.socket = undefined;
  };

  // Handle an incoming message from the server. The message will be passed to
  // any callbacks.
  private handleMessage = (ev: MessageEvent) => {
    let data: P;

    try {
      data = JSON.parse(ev.data as string) as P;
    } catch (e) {
      throw new Error(`Error parsing payload: ${ (e as Error).message }`);
    }

    this.messageCallbacks.forEach((cb) => cb(data));
  };

  // Handle the stream opening by triggering any registered callbacks.
  private handleOpen = () => {
    this.openCallbacks.forEach((cb) => cb());
  };

  // Handle the stream closing by triggering any registered callbacks. This will
  // also clear the socket, allowing it to be reconnected automatically if not
  // explicitly closed.
  private handleClose = () => {
    this.socket = undefined;
    this.closeCallbacks.forEach((cb) => cb());
  };

  // Handle a stream error by closing the socket and allowing it to be
  // reconnected automatically.
  private handleError = () => {
    this.closeSocket();
  };
}

const getStream =
  <E extends Endpoint>(endpoint: E):
  Stream<IncomingPayload<E>, OutgoingPayload<E>> => {
    return new Stream(endpoint);
  };

// Return a stream for the pose endpoint.
export const getPoseStream = () => (
  getStream(Endpoint.pose)
);

// Return a stream for the paused endpoint.
export const getPausedStream = () => (
  getStream(Endpoint.paused)
);

// useStream is a hook that can use a streaming API endpoint from above. It gets
// a 'streamer' function that will return a stream when called, and it will then
// connect to the stream, pass message events to the callback, and clean up the
// stream when finished. The underlying stream will be returned for
// bidirectional communication, along with a flag indicating whether the stream
// is currently connected.
export const useStream = <
  P extends IncomingPayload<Endpoint>,
  Q extends OutgoingPayload<Endpoint>
>(streamer: () => Stream<P, Q>, callback?: (payload: P) => void) => {

  const savedCallback = useRef<(payload: P) => void>();
  const savedStream = useRef<Stream<P,Q>>();

  const [connected, setConnected] = useState(false);

  // Save the callback in a ref
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Instantiate the streamer and store it in a ref. Return a function that will
  // close the stream.
  useEffect(() => {
    const stream = streamer();

    stream.onOpen(() => setConnected(true));
    stream.onClose(() => setConnected(false));

    savedStream.current = stream;

    return () => stream.close();
  }, [streamer]);

  // Attach the supplied callback to the stream's message handler, and clean it
  // up in the return function.
  useEffect(() => {
    if (savedCallback.current && savedStream.current) {
      savedStream.current.onMessage(savedCallback.current);
    }

    return () => {
      if (savedCallback.current && savedStream.current) {
        savedStream.current.offMessage(savedCallback.current);
      }
    };
  }, [streamer, callback]);

  // Return connection state and a ref to the underlying stream
  return { connected, stream: savedStream.current };
};
