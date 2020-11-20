/*
 * Copyright 2020 RoadieHQ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { errorApiRef, useApi } from '@backstage/core';
import { useCallback, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { buildKiteApiRef } from '../api';
import { BuildkiteBuildInfo } from './types';
import { generateRequestUrl } from './utils';

export const transform = (
  buildsData: BuildkiteBuildInfo[],
  restartBuild: (requestUrl: string) => Promise<void>,
): BuildkiteBuildInfo[] => {
  return buildsData.map(buildData => {
    const tableBuildInfo: BuildkiteBuildInfo = {
      ...buildData,
      onRestartClick: () => {
        restartBuild(generateRequestUrl(buildData.url));
      }
    };
    return tableBuildInfo;
  });
};

export const useBuilds = ({owner, repo}: {owner: string, repo: string}) => {
  // const { repo, owner, vcs } = useProjectSlugFromEntity();
  const api = useApi(buildKiteApiRef);
  const errorApi = useApi(errorApiRef);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [state, setState] = useState([]);

  const getBuilds = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      try {
        return await api.getBuilds(offset + 1, limit);
      } catch (e) {
        errorApi.post(e);
        return Promise.reject(e);
      }
    },
    [api, errorApi],
  );
 
  const restartBuild = async (requestUrl: string) => {
    try {
      const response = await api.restartBuild(requestUrl).then(() => getBuilds({limit: pageSize, offset: page}));
      setState(response);
      return response;
    } catch (e) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  };

  const { loading, retry } = useAsyncRetry(
    () =>
      getBuilds({
        limit: pageSize,
        offset: page,
      })
      .then(builds => {
        if(page === 0) setTotal(builds?.[0].number);
        const response = transform(builds ?? [], restartBuild) as any
        setState(response);
      }),
    [page, pageSize, getBuilds],
  );

  const projectName = `${owner}/${repo}`;

  return [
    {
      page,
      pageSize,
      loading: loading ,
      builds: state as BuildkiteBuildInfo[],
      projectName,
      total,
    },
    {
      getBuilds,
      setPage,
      setPageSize,
      restartBuild,
      retry,
    },
  ] as const;
}
