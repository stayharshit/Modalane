// global styles
import "../assets/css/styles.scss";
import "swiper/swiper.scss";
import "rc-slider/assets/index.css";
import "react-rater/lib/react-rater.css";

// types
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import Router from "next/router";
import React, { Fragment, useEffect, useState } from "react";

import appConfig from "@/lib/app-config";

import { wrapper } from "../store";
import * as gtag from "../utils/gtag";

const isProduction = appConfig.isProduction;

// only events on production
if (isProduction) {
  // Notice how we track pageview when route is changed
  Router.events.on("routeChangeComplete", (url: string) => gtag.pageview(url));
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--main-font",
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleNavigationStart = () => setIsNavigating(true);
    const handleNavigationEnd = () => setIsNavigating(false);

    Router.events.on("routeChangeStart", handleNavigationStart);
    Router.events.on("routeChangeComplete", handleNavigationEnd);
    Router.events.on("routeChangeError", handleNavigationEnd);

    return () => {
      Router.events.off("routeChangeStart", handleNavigationStart);
      Router.events.off("routeChangeComplete", handleNavigationEnd);
      Router.events.off("routeChangeError", handleNavigationEnd);
    };
  }, []);

  return (
    <Fragment>
      <style jsx global>{`
        :root {
          --main-font: ${poppins.style.fontFamily};
        }
      `}</style>
      {isNavigating && (
        <div className="page-loader" role="status">
          <span className="page-loader__spinner" aria-hidden="true" />
          <span className="visually-hidden">Loading page</span>
        </div>
      )}
      <Component {...pageProps} />
    </Fragment>
  );
};

export default wrapper.withRedux(MyApp);
