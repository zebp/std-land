import { NextApiRequest, NextApiResponse } from 'next';
import { match } from 'ts-pattern';
import { SearchItem } from '@/search';

import stableData from '@/deno-data.stable.json';
import gitData from '@/deno-data.git.json';

export interface FetchDocsResponse {
  success: boolean;
  data: SearchItem[];
}

export default function fetchModule(req: NextApiRequest, res: NextApiResponse) {
  const moduleName = req.query.module as string;
  const docs = match(moduleName)
    .with(`std`, () => stableData)
    .with(`git`, () => gitData)
    .otherwise(() => undefined) as SearchItem[] | undefined;

  res.statusCode = docs !== undefined ? 200 : 404;
  res.json({
    success: docs !== undefined,
    data: docs,
  });
}
