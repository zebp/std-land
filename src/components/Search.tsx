import { useCallback, useEffect, useState } from 'react';
import { fuse, SearchItem } from '@/search';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsFileCode } from 'react-icons/bs';
import { match } from 'ts-pattern';
import styles from './Search.module.css';

interface SearchBoxProps {
  value: string;
  onChange: (text: string) => void;
  sendMessage: (message: Message) => void;
}

function SearchBox({ value, onChange, sendMessage }: SearchBoxProps) {
  return (
    <div id={styles.searchbox}>
      <AiOutlineSearch className={styles.icon} />
      <input
        placeholder="Search the Deno standard library"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          const message = match(e.code)
            .with(`ArrowDown`, () => `down`)
            .with(`ArrowUp`, () => `up`)
            .with(`Enter`, () => `go`)
            .with(`Escape`, () => `cancel`)
            .otherwise(() => undefined) as Message | undefined;

          if (message) {
            e.preventDefault();
            sendMessage(message);
          }
        }}
      />
    </div>
  );
}

interface ResultProps {
  item: SearchItem;
  selected: boolean;
}

function Result({ item, selected }: ResultProps) {
  const onClick = () => {
    window.location.href = `https://deno.land/std/${item.path}`;
  };

  const classes = selected
    ? `${styles.selected} ${styles.result}`
    : styles.result;

  return (
    // eslint-disable-next-line
    <div className={classes} onClick={onClick}>
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

type Message = 'up' | 'down' | 'cancel' | 'go';

export default function Search({
  results: initialResults,
  query: initialQuery,
}: SearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults ?? []);
  const [selection, setSelection] = useState<number | undefined>();

  const moveSelection = (offset: number) =>
    setSelection(
      (selection !== undefined ? selection + offset : 0) % results.length,
    );

  const process = useCallback(
    (message: Message) => {
      if (results.length === 0) {
        return;
      }

      match(message)
        .with(`up`, () => moveSelection(results.length - 1))
        .with(`down`, () => moveSelection(1))
        .with(`go`, () => {
          const item = results[selection ?? 0];
          window.location.href = `https://deno.land/std/${item.path}`;
        })
        .with(`cancel`, () => setSelection(undefined))
        .run();
    },
    [results, selection, setSelection],
  );

  // Updates our search results whenever we get a new query from the search box.
  useEffect(() => {
    if (query === ``) return;

    const newResults = fuse
      .search(query)
      .map(({ item }) => item)
      .slice(0, 4);

    setResults(newResults);

    if (newResults.length === 0) {
      setSelection(undefined);
    } else if (selection) {
      setSelection(selection % newResults.length);
    }
  }, [query]);

  const elemHeight = query !== `` ? results.length * 3.5 : 0;
  const heightStyles = {
    height: `${4 + elemHeight}rem`,
  };

  return (
    <div id={styles.search} style={heightStyles}>
      <SearchBox onChange={setQuery} value={query} sendMessage={process} />
      {results.map((item, index) => (
        <Result key={item.path} item={item} selected={index === selection} />
      ))}
    </div>
  );
}
