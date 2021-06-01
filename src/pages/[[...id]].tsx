import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { match } from 'ts-pattern';
import { fuse, SearchResult } from '@/search';
import Search from '@/components/Search';

import styles from '@/styles/Lookup.module.css';

interface LookupProps {
  query: string | null;
  results: SearchResult[];
}

export default function Lookup({ results, query }: LookupProps) {
  return (
    <div id={styles.container}>
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

  // TODO: Make this threshold configurable.
  if (firstResult?.score ?? 1 < 0.03) {
    return {
      redirect: {
        permanent: false,
        destination: `https://deno.land/std/${firstResult.item.path}`,
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
