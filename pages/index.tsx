import Head from 'next/head';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import styles from '../styles/index.module.css';

const RobotStatus = dynamic(() => import('../components/RobotStatus'), { ssr: false });
const RobotIcon = dynamic(() => import('../components/RobotIcon'), { ssr: false });

const Home = () => {
  return (
    <div className={ styles.container }>
      <Head>
        <title>Robot Map tool</title>
        <meta name="description" content="A basic robot front-end" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={ styles.header }>
        Robot front-end
      </header>

      <main className={ styles.main }>
        <div className={ styles.map }>
          <RobotIcon />
          <div>
            <Image src="/images/map.png" layout="fill" objectFit="contain" alt="map for the robot" />
          </div>
        </div>
        <RobotStatus />
      </main>

      <footer className={ styles.footer }>
        Powered by <a href="https://nextjs.org" target='_blank' rel="noreferrer">Next.js</a>
      </footer>
    </div>
  );
};

export default Home;
