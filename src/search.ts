import Fuse from 'fuse.js';
import searchData from './deno-data.json';

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

/**
 * The utility used to fuzzy search through all our data.
 */
export const fuse = new Fuse(searchData as SearchItem[], {
  // Include the score in the results so we can later determine if it's enough of a match to
  // automatically redirect.
  includeScore: true,
  // Try to fuzzy search against the `name` and `path` fields in the objects.
  keys: [`path`, `name`],
});

export interface SearchItem {
  name: string;
  extension: string;
  path: string;
  type: DenoItemType;
  lineNumber?: number;
}

export type SearchResult = Fuse.FuseResult<SearchItem>;
