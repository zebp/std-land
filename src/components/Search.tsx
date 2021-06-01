import { useCallback, useEffect, useState } from 'react';
import { DenoItemType, fuse, SearchItem } from '@/search';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsFileCode } from 'react-icons/bs';
import {
  VscLink,
  VscSymbolClass,
  VscSymbolEnum,
  VscSymbolMethod,
} from 'react-icons/vsc';
import { match, select } from 'ts-pattern';
import { IconType } from 'react-icons';
import useHover from 'react-use-hover';
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
            .otherwise(() => undefined) as SimpleMessageType;

          if (message) {
            e.preventDefault();
            sendMessage({ type: message });
          }
        }}
      />
    </div>
  );
}

interface ResultProps {
  item: SearchItem;
  selected: boolean;
  index: number;
  sendMessage: (message: Message) => void;
}

function goToItem(item: SearchItem) {
  let url = `https://deno.land/std/${item.path}`;
  if (item.lineNumber) url += `#L${item.lineNumber}`;
  window.location.href = url;
}

function Result({ item, selected, index, sendMessage }: ResultProps) {
  const [isHovering, hoveringProps] = useHover();
  useEffect(() => {
    if (isHovering) {
      sendMessage({ type: `select`, index });
    }
  }, [isHovering]);

  const darkMode = window.matchMedia(`(prefers-color-scheme: dark)`).matches;
  const classes = selected
    ? `${styles.selected} ${styles.result}`
    : styles.result;
  const [IconElem, iconColor] = match(item.type)
    .with(DenoItemType.Class, () => [VscSymbolClass, `#32a852`])
    .with(DenoItemType.Function, () => [VscSymbolMethod, `#a468bf`])
    .with(DenoItemType.Enum, () => [VscSymbolEnum, `#2fd5d5`])
    .with(DenoItemType.TypeAlias, () => [VscLink, `#1e5fb3`])
    .otherwise(() => [BsFileCode, darkMode ? `#888` : `#323232`]) as [
    IconType,
    string,
  ];
  const iconStyles = { color: iconColor };

  return (
    // eslint-disable-next-line
    <div className={classes} onClick={() => goToItem(item)} {...hoveringProps}>
      <IconElem style={iconStyles} />
      <span className={styles.name}>{item.name}</span>
      <span className={styles.path}>{item.path}</span>
    </div>
  );
}

export interface SearchProps {
  query: string;
  results?: SearchItem[];
}

type SimpleMessageType = 'up' | 'down' | 'cancel' | 'go';
type Message = { type: SimpleMessageType } | { type: 'select'; index: number };

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
        .with({ type: `up` }, () => moveSelection(results.length - 1))
        .with({ type: `down` }, () => moveSelection(1))
        .with({ type: `go` }, () => goToItem(results[selection ?? 0]))
        .with({ type: `cancel` }, () => setSelection(undefined))
        .with({ type: `select`, index: select(`index`) }, ({ index }) =>
          setSelection(index),
        )
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
      .slice(0, 6);

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
      {results.map((item, index) => {
        const key = `${item.path}-${item.name}-${item.type}@${item.lineNumber}`;

        return (
          <Result
            key={key}
            item={item}
            selected={index === selection}
            sendMessage={process}
            index={index}
          />
        );
      })}
    </div>
  );
}
