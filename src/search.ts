import Fuse from 'fuse.js';
import searchData from '../data.json';

export { searchData };

export const fuse = new Fuse(searchData as SearchItem[], {
  includeScore: true,
  keys: [`path`, `name`],
});

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

export interface SearchItem {
  name: string;
  extension: string;
  path: string;
  type: DenoItemType;
  lineNumber?: number;
}

export type SearchResult = Fuse.FuseResult<SearchItem>;
