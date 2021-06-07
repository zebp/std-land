import { useCallback, useEffect, useState } from 'react';
import { createSearcher, DenoItemType, SearchItem } from '@/search';
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
import { FetchDocsResponse } from '@/pages/api/docs/[module]';
import useHover from 'react-use-hover';
import useKeyPress from '@/hooks/useKeyPress';

import styles from './Search.module.css';

interface SearchBoxProps {
  value: string;
  onChange: (text: string) => void;
  /**
   * Sends a message to the search container to manipulate the selected result.
   */
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
  /**
   * Sends a message to the search container to manipulate the selected result.
   */
  sendMessage: (message: Message) => void;
}

/**
 * Goes to the item's source or documentation for the Deno standard library.
 * @param item an item from the Deno stdlib.
 */
function goToItem(item: SearchItem, visitDocs: boolean) {
  const isGit = window.location.hostname.startsWith(`git.`);

  if (!visitDocs || isGit) {
    let url = isGit
      ? `https://github.com/denoland/deno_std/blob/main/${item.path}`
      : `https://deno.land/std/${item.path}`;
    if (item.lineNumber) url += `#L${item.lineNumber}`;
    window.location.href = url;
  } else {
    window.location.href = `https://doc.deno.land/https/deno.land/std/${item.path}`;
  }
}

/// A component for search results.
function Result({ item, selected, index, sendMessage }: ResultProps) {
  const [isHovering, hoveringProps] = useHover();
  const isShiftDown = useKeyPress(`Shift`);
  useEffect(() => {
    if (isHovering) {
      // Sends a message to the search container when we hover over the result to select this item.
      sendMessage({ type: `select`, index });
    }
  }, [isHovering]);

  // The CSS classes to apply to the result container depending on if the result is selected.
  const classes = selected
    ? `${styles.selected} ${styles.result}`
    : styles.result;

  // The icon element that we will render along side the name and path of the result and it's color.
  const [IconElem, iconColor] = match(item.type)
    .with(DenoItemType.Class, () => [VscSymbolClass, `#32a852`])
    .with(DenoItemType.Function, () => [VscSymbolMethod, `#a468bf`])
    .with(DenoItemType.Enum, () => [VscSymbolEnum, `#2fd5d5`])
    .with(DenoItemType.TypeAlias, () => [VscLink, `#1e5fb3`])
    .otherwise(() => [BsFileCode, `#9f5c8e`]) as [IconType, string];
  const iconStyles = { color: iconColor };

  return (
    // eslint-disable-next-line
    <div
      className={classes}
      onClick={() => goToItem(item, isShiftDown)}
      {...hoveringProps}
    >
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

/**
 * Message types that don't have any corresponding data, we need this as it's own type alias so we
 * can refer to it with a cast in the {@link SearchBox} component.
 */
type SimpleMessageType = 'up' | 'down' | 'cancel' | 'go';

/**
 * Messages used to control the selected elements of the search results.
 */
type Message = { type: SimpleMessageType } | { type: 'select'; index: number };

export default function Search({
  results: initialResults,
  query: initialQuery,
}: SearchProps) {
  const [searcher, setSearcher] = useState(createSearcher([]));
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults ?? []);
  const [selection, setSelection] = useState<number | undefined>();
  const isShiftDown = useKeyPress(`Shift`);

  const moveSelection = (offset: number) =>
    setSelection(
      (selection !== undefined ? selection + offset : 0) % results.length,
    );

  // Handles messages related to setting the selected item.
  const handleMessage = useCallback(
    (message: Message) => {
      if (results.length === 0) {
        return;
      }

      match(message)
        .with({ type: `up` }, () => moveSelection(results.length - 1))
        .with({ type: `down` }, () => moveSelection(1))
        .with({ type: `go` }, () =>
          goToItem(results[selection ?? 0], isShiftDown),
        )
        .with({ type: `cancel` }, () => setSelection(undefined))
        .with({ type: `select`, index: select(`index`) }, ({ index }) =>
          setSelection(index),
        )
        .run();
    },
    [results, selection, setSelection, isShiftDown],
  );

  useEffect(() => {
    const isGit = window.location.hostname.startsWith(`git.`);
    fetch(`/api/docs/${isGit ? `git` : `std`}`)
      .then((res) => res.json())
      .then((res: FetchDocsResponse) => {
        const newSearcher = createSearcher(res.data);
        setSearcher(newSearcher);
      });
  }, [setSearcher]);

  // Updates our search results whenever we get a new query from the search box.
  useEffect(() => {
    if (query === ``) return;

    const newResults = searcher
      .search(query)
      .map(({ item }) => item)
      .slice(0, 6);

    setResults(newResults);

    if (newResults.length === 0) {
      setSelection(undefined);
    } else if (selection) {
      setSelection(selection % newResults.length);
    }
  }, [searcher, query]);

  // Hacky fix to get the height animation to work propertly.
  // TODO: Make some of these magic values into constants.
  const elemHeight = query !== `` ? results.length * 3.5 : 0;
  const heightStyles = {
    height: `${4 + elemHeight}rem`,
  };

  return (
    <div id={styles.search} style={heightStyles}>
      <SearchBox
        onChange={setQuery}
        value={query}
        sendMessage={handleMessage}
      />
      {results.map((item, index) => (
        <Result
          key={`${item.path}-${item.name}-${item.type}@${item.lineNumber}`}
          item={item}
          selected={index === selection}
          sendMessage={handleMessage}
          index={index}
        />
      ))}
    </div>
  );
}
