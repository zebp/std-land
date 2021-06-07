import React from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { match } from 'ts-pattern';
import { SearchResult, createSearcher, SearchItem } from '@/search';
import Search from '@/components/Search';
import PopulatedHead from '@/components/PopulatedHead';
import stableData from '@/deno-data.stable.json';
import gitData from '@/deno-data.git.json';

import styles from '@/styles/Lookup.module.css';

/**
 * A searcher that has the data of the currently stable Deno standard library.
 */
const stableSearcher = createSearcher(stableData as SearchItem[]);
/**
 * A searcher that has the data from the main branch of the Deno standard library repository.
 */
const gitSearcher = createSearcher(gitData as SearchItem[]);

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

      <p id={styles.footer}>
        Check it out on
        <a href="https://github.com/zebp/std-land"> Github </a>
        or <Link href="/donate">donate</Link> to keep the domain alive.
      </p>
    </div>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<LookupProps>> {
  if (context.req.url?.includes(`/api/docs`) ?? true) {
    return { notFound: true };
  }

  const isGit = context.req.headers.host?.startsWith(`git.`) ?? false;
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

  const searcher = isGit ? gitSearcher : stableSearcher;
  const results = searcher.search(id);
  const firstResult = results[0];

  const firstScore = results[0]?.score ?? 1;
  const secondScore = results[1]?.score ?? 1;

  const isGoodEnoughMatch =
    (firstScore < 0.0003 && secondScore - firstScore > 0.0002) ||
    firstResult?.item.path === id;

  if (isGoodEnoughMatch) {
    const { item } = firstResult;
    let url = isGit
      ? `https://github.com/denoland/deno_std/blob/main/${item.path}`
      : `https://deno.land/std/${item.path}`;
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
