import React from "react";
import Head from "next/head";
import Header from "../components/Header"
import NavBar  from "./NavBar";
import DemoBanner from "./DemoBanner";
import Footer from "./Footer/Footer";

const Layout = ({ children }) => {
return (
<>
    <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="next-head-count" content="10" />
    </Head>
    <header>
        <Header />
        <NavBar />
    </header>
    <div className="layout">
        <main className="main-container">
            {children}
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
</>
);
};

export default Layout;