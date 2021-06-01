import React from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { match } from 'ts-pattern';
import { fuse, SearchResult } from '@/search';
import Search from '@/components/Search';
import PopulatedHead from '@/components/PopulatedHead';

import styles from '@/styles/Lookup.module.css';

interface LookupProps {
  query: string | null;
  results: SearchResult[];
}

export default function Lookup({ results, query }: LookupProps) {
  return (
    <div id={styles.container}>
      <PopulatedHead />

      <h1 id={styles.title}>std.land</h1>
      <Search
        query={query || ``}
        results={results.slice(0, 4).map(({ item }) => item)}
      />
    </div>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<LookupProps>> {
  const rawId = context.params?.id;
  if (rawId === undefined) {
    return {
      props: {
        query: null,
        results: [],
      },
    };
  }

  const id = match(typeof rawId)
    .with(`string`, () => rawId as string)
    .otherwise(() => (rawId as string[]).join(`/`));

  const results = fuse.search(id);
  const firstResult = results[0];

  const firstScore = results[0]?.score ?? 1;
  const secondScore = results[1]?.score ?? 1;

  const isGoodEnoughMatch =
    (firstScore < 0.0003 && secondScore - firstScore > 0.0002) ||
    firstResult.item.path === id;

  if (isGoodEnoughMatch) {
    const { item } = firstResult;
    let url = `https://deno.land/std/${item.path}`;
    if (item.lineNumber) url += `#L${item.lineNumber}`;

    return {
      redirect: {
        permanent: false,
        destination: url,
      },
    };
  }

  return {
    props: {
      query: id as string | null,
      results,
    },
  };
}
