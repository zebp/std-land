import Fuse from 'fuse.js';
import searchData from '../data.json';

export { searchData };

export const fuse = new Fuse(searchData, {
  keys: [`path`, `name`],
});

export interface SearchItem {
  name: string;
  extension: string;
  path: string;
}

export type SearchResult = Fuse.FuseResult<SearchItem>;
