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
  const rawId = context.params?.id as string | string[];
  const id = match(typeof rawId)
    .with(`string`, () => rawId as string)
    .otherwise(() => (rawId as string[]).join(`/`));

  return {
    props: {
      query: id as string | null,
      results: fuse.search(id),
    },
  };
}
