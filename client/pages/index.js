import React from "react";
// import Head from "next/head";

import HeroHome from "../components/HeroHome";
import FeaturesHome from "../components/Features";
import FeaturesBlocks from "../components/FeaturesBlock";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";

const Home = () => {
  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/*  Site header */}
        {/* <Header /> */}

        {/*  Page content */}
        <main className="flex-grow">
          {/*  Page sections */}
          <HeroHome />
          <FeaturesHome />
          <FeaturesBlocks />
          <Testimonials />
          <Newsletter />
        </main>

        {/* <Banner /> */}

        {/*  Site footer */}
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Home;
