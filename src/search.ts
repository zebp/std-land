import Fuse from 'fuse.js';

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

export function createSearcher(collection: SearchItem[]): Fuse<SearchItem> {
  return new Fuse(collection, {
    // Include the score in the results so we can later determine if it's enough of a match to
    // automatically redirect.
    includeScore: true,
    // Try to fuzzy search against the `name` and `path` fields in the objects.
    keys: [`path`, `name`],
  });
}

export interface SearchItem {
  name: string;
  extension: string;
  path: string;
  type: DenoItemType;
  lineNumber?: number;
}

export type SearchResult = Fuse.FuseResult<SearchItem>;
