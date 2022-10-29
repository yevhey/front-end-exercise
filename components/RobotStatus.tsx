import styles from './RobotStatus.module.css';

import { useCallback, useState } from 'react';

import Map from './Map';
import { getPoseStream, useStream, PosePayload, getPausedStream } from '../lib/stream';

const RobotStatus = () => {

  // Pause state
  const { connected: pausedConnected, stream: pausedStream } = useStream(getPausedStream);

  // Current pose
  const [pose, setPose] = useState<PosePayload>();
  const { connected: poseConnected } =
    useStream(getPoseStream, (payload) => setPose(payload) );

  // Connection status
  const status = poseConnected ? (
    <div className={ styles.connected }>
      Connection online
    </div>
  ) : (
    <div className={ styles.disconnected }>
      Connection offline
    </div>
  );

  // Current pose
  const poseValue = (poseConnected && pose) ? (
    <div className={ styles.pose }>
      <strong>Current robot pose</strong>
      <code>x={formatNumber(pose.x)}, y={formatNumber(pose.y)}, angle={formatNumber(pose.angle)}</code>
    </div>
  ) : (
    null
  );

  // Pause and unpause buttons
  const pause = useCallback(() => pausedStream?.send({ paused: true }), [pausedStream]);
  const unpause = useCallback(() => pausedStream?.send({ paused: false }), [pausedStream]);
  const pauseButton = pausedConnected ? (
    <div className={ styles.buttons }>
      <button onClick={ unpause }>Start moving</button>
      <button onClick={ pause }>Stop moving</button>
    </div>
  ) : null;

  // Component content
  return (
    <>
      <div className={ styles.container }>
        { status }
        { poseValue }
        { pauseButton }
      </div>
      <Map />
    </>
  );
};

const formatNumber = (num: number) => +num.toFixed(2);

export default RobotStatus;
