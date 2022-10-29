import Image from 'next/image';

import RobotIcon from './RobotIcon';
import styles from './Map.module.css';

const Map = () => {
  // Component content
  return (
    <div className={ styles.map }>
      <RobotIcon />
      <div>
        <Image src="/images/map.png" layout="fill" objectFit="contain" alt="map for the robot" />
      </div>
    </div>
  );
};

export default Map;
