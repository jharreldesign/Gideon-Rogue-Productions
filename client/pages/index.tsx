// pages/index.tsx
import Header from '../components/Header';
import Hero from '../components/Hero';
import EventList from '../components/EventList';
import Footer from '../components/Footer';
import styles from '../styles/Index.module.css';
import Image from 'next/image'; 

const Index = () => {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <Hero className={styles.heroSection} />
      <EventList className={styles.eventListContainer} />

      {/* Tour Posters Section */}
      <section className={styles.tourPosters}>
        <h2>Upcoming Tours</h2>
        <div className={styles.posterGallery}>
          <div className={styles.poster}>
            <Image
              src="https://www.masqueradeatlanta.com/wp-content/uploads/2024/11/121024_blackflag_ForSLIDER-360x555.jpg"
              alt="Tour Poster 1"
              width={360} // Set width for the image
              height={555} // Set height for the image
            />
          </div>
          <div className={styles.poster}>
            <Image
              src="https://www.masqueradeatlanta.com/wp-content/uploads/2024/12/122124_thetaylorparty_ForSlider-360x555.jpg"
              alt="Tour Poster 2"
              width={360}
              height={555}
            />
          </div>
          <div className={styles.poster}>
            <Image
              src="https://www.prestoimages.net/store30/rd227/227_pd3808693_1.jpg"
              alt="Tour Poster 3"
              width={360}
              height={555}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
