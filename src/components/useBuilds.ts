/*
 * Copyright 2020 Spotify AB
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
import { useCallback, useEffect, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { buildKiteApiRef } from '../api';
import type { CITableBuildInfo } from './BuildKiteBuildsTable';
import { useEntity } from '@backstage/plugin-catalog';
import { BUILDKITE_ANNOTATION } from '../consts';

const makeReadableStatus = (status: string | undefined) => {
  if (!status) return '';
  return ({
    retried: 'Retried',
    canceled: 'Canceled',
    infrastructure_fail: 'Infra fail',
    timedout: 'Timedout',
    not_run: 'Not run',
    running: 'Running',
    failed: 'Failed',
    queued: 'Queued',
    scheduled: 'Scheduled',
    not_running: 'Not running',
    no_tests: 'No tests',
    fixed: 'Fixed',
    success: 'Success',
  } as Record<string, string>)[status];
};

// export const transform = (
//   buildsData: BuildSummary[],
//   restartBuild: { (buildId: number): Promise<void> },
// ): CITableBuildInfo[] => {
//   return buildsData.map(buildData => {
//     const tableBuildInfo: CITableBuildInfo = {
//       id: String(buildData.build_num),
//       buildName: buildData.subject
//         ? buildData.subject +
//           (buildData.retry_of ? ` (retry of #${buildData.retry_of})` : '')
//         : '',
//       onRestartClick: () =>
//         typeof buildData.build_num !== 'undefined' &&
//         restartBuild(buildData.build_num),
//       source: {
//         branchName: String(buildData.branch),
//         commit: {
//           hash: String(buildData.vcs_revision),
//           url: 'todo',
//         },
//       },
//       status: makeReadableStatus(buildData.status),
//       buildUrl: buildData.build_url,
//     };
//     return tableBuildInfo;
//   });
// };

export const useBuilds = ({owner, repo}: {owner: string, repo: string}) => {
  // const { repo, owner, vcs } = useProjectSlugFromEntity();
  const api = useApi(buildKiteApiRef);
  const errorApi = useApi(errorApiRef);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const getBuilds = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      try {
        return await api.getBuilds();
      } catch (e) {
        errorApi.post(e);
        return Promise.reject(e);
      }
    },
    [repo, owner, api, errorApi],
  );

  const restartBuild = async (buildId: number) => {
    try {
      await api.getBuilds();
    } catch (e) {
      errorApi.post(e);
    }
  };

  useEffect(() => {
    getBuilds({limit: 5, offset: 5});
    // getBuilds({ limit: 1, offset: 0 }).then(b => setTotal(b?.[0].build_num!));
  }, [repo, getBuilds]);

  const { loading, value, retry } = useAsyncRetry(
    () =>
      getBuilds({
        offset: page * pageSize,
        limit: pageSize,
      }),
    [page, pageSize, getBuilds],
  );

  const projectName = `${owner}/${repo}`;

  return [
    {
      page,
      pageSize,
      loading,
      builds: value,
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
