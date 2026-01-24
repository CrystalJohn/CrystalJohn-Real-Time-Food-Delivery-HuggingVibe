import styles from "./page.module.scss";

function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Real-Time Food Delivery</h1>
      <p className={styles.description}>Welcome to your Next.js application</p>
    </div>
  );
}

export default Home;
