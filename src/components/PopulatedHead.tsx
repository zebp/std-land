import Head from 'next/head';
import React from 'react';

export default function PopulatedHead() {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <meta
        name="description"
        content="Fuzzy finder for the Deno standard library"
      />
      <meta
        property="og:description"
        content="Fuzzy finder for the Deno standard library"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://std.land/" />
      <meta property="og:image" content="/favicon-32x32.png" />
      <meta property="og:title" content="std.land" />
      <meta property="og:site_name" content="std.land" />
      <meta name="theme-color" content="#eeeeee" />
      <link rel="icon" href="favicon.ico" type="image/x-icon" />
      <title>std.land</title>
    </Head>
  );
}
