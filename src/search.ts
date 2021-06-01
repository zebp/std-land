import Fuse from 'fuse.js';
import stableData from './deno-data.stable.json';
import gitData from './deno-data.git.json';

// Eslint bug?
// eslint-disable-next-line no-shadow
export enum DenoItemType {
  Class = `class`,
  Enum = `enum`,
  File = `file`,
  Function = `function`,
  Import = `import`,
  Variable = `variable`,
  Interface = `interface`,
  Namespace = `namespace`,
  TypeAlias = `typeAlias`,
}

function createSearcher(collection: SearchItem[]): Fuse<SearchItem> {
  return new Fuse(collection, {
    // Include the score in the results so we can later determine if it's enough of a match to
    // automatically redirect.
    includeScore: true,
    // Try to fuzzy search against the `name` and `path` fields in the objects.
    keys: [`path`, `name`],
  });
}

/**
 * A searcher that has the data of the currently stable Deno standard library.
 */
const stableSearcher = createSearcher(stableData as SearchItem[]);
/**
 * A searcher that has the data from the main branch of the Deno standard library repository.
 */
const gitSearcher = createSearcher(gitData as SearchItem[]);

/**
 * The utility used to fuzzy search through all our data.
 */
export function search(input: string, useGitData: boolean): SearchResult[] {
  const searcher = useGitData ? gitSearcher : stableSearcher;
  return searcher.search(input);
}

export interface SearchItem {
  name: string;
  extension: string;
  path: string;
  type: DenoItemType;
  lineNumber?: number;
}

export type SearchResult = Fuse.FuseResult<SearchItem>;
