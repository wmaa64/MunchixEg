import React from "react";
import {Toaster} from "react-hot-toast";
import {Layout} from "../components";
import "../styles/globals.css"; /* common page elements */
import "../styles/index.scss";  /* main styles */
//import "../styles/mobile.css"; /* mobile styles */
//import "../styles/tablet.css"; /* tablet styles */
import "../styles/overrides/portable.css"; /* override tablet styles for portrait */

import { StateContext } from "../../context/StateContext";
import { DefaultSeo } from "next-seo";
import SEO from "../../next-seo.config";

function MyApp({ Component, pageProps }) {
return (
  <>
    <DefaultSeo
      {...SEO}
      title="Next SEO Example"
      description="Next SEO is a plug in that makes managing your SEO easier in Next.js projects."
      twitter={{
        handle: "@handle",
        site: "@site",
        cardType: "summary_large_image",
      }}
    />
    
    <StateContext>
      <Layout>
        <Toaster />
        <Component {...pageProps} />;
      </Layout>
    </StateContext>
  </>

);
}
export default MyApp;
