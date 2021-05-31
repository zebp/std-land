import { useEffect, useState } from 'react';
import { fuse, SearchItem } from '@/search';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsFileCode } from 'react-icons/bs';
import styles from './Search.module.css';

interface SearchBoxProps {
  value: string;
  onChange: (text: string) => void;
}

function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div id={styles.searchbox}>
      <AiOutlineSearch className={styles.icon} />
      <input
        placeholder="Search the Deno standard library"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface ResultProps {
  item: SearchItem;
}

function Result({ item }: ResultProps) {
  const onClick = () => {
    window.location.href = `https://deno.land/std/${item.path}`;
  };

  return (
    // eslint-disable-next-line
    <div className={styles.result} onClick={onClick}>
      <BsFileCode className={styles.icon} />
      <span className={styles.name}>{item.name}</span>
      <span className={styles.path}>{item.path}</span>
    </div>
  );
}

export interface SearchProps {
  query: string;
  results?: SearchItem[];
}

export default function Search({
  results: initialResults,
  query: initialQuery,
}: SearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults ?? []);

  // Updates our search results whenever we get a new query from the search box.
  useEffect(() => {
    if (query === ``) return;

    setResults(
      fuse
        .search(query)
        .map(({ item }) => item)
        .slice(0, 4),
    );
  }, [query]);

  const elemHeight = query !== `` ? results.length * 3.5 : 0;
  const heightStyles = {
    height: `${4 + elemHeight}rem`,
  };

  return (
    <div id={styles.search} style={heightStyles}>
      <SearchBox onChange={setQuery} value={query} />
      {results.map((item) => (
        <Result key={item.path} item={item} />
      ))}
    </div>
  );
}
