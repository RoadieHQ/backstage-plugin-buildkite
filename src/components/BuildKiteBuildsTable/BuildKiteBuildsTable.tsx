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
import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { generatePath, Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Link, Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core';
import RetryIcon from '@material-ui/icons/Replay';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Entity } from '@backstage/catalog-model';
import { buildKiteBuildRouteRef } from '../route-refs';
import { useBuilds } from '../useBuilds';
import { useProjectEntity } from '../useProjectEntity';
import { BuildKiteStatus } from './components/BuildKiteRunStatus';

const useStyles = makeStyles({
  avatar: {
    height: 32,
    width: 32,
    borderRadius: '50%',
  },
});

export type CITableBuildInfo = {
  id: string;
  number: number;
  buildName: string;
  buildUrl: string;
  source: {
    branchName: string;
    url: string;
    displayName: string;
    author?: string;
    commit: {
      hash: string;
    };
  };
  state: string;
  tests?: {
    total: number;
    passed: number;
    skipped: number;
    failed: number;
    testUrl: string;
  };
  onRestartClick: () => void;
};

type TableProps = {
  loading: boolean;
  retry: () => void;
  builds: CITableBuildInfo[];
  projectName: string;
  page: number;
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
};

const generatedColumns: TableColumn[] = [
  {
    title: 'Id',
    field: 'number',
    highlight: true,
    render: (row: Partial<CITableBuildInfo>) => {
      return (
          row.number
      );
    },
  },
  {
    title: 'Build',
    field: 'buildName',
    highlight: true,
    render: (row: Partial<CITableBuildInfo>) => {
      return (
        <Link
          component={RouterLink}
          to={generatePath(buildKiteBuildRouteRef.path, {
            buildId: row.id as string,
          })}
        >
          {row.id}
        </Link>
      );
    },
  },
  {
    title: 'Source',
    field: 'source',
    render: (row: Partial<CITableBuildInfo>) => (
      <>
        <p>
          <Link href={row.source?.url || ''} target="_blank">
            {row.source?.branchName}
          </Link>
        </p>
        <p>{row.source?.commit?.hash}</p>
      </>
    ),
  },
  {
    title: 'Status',
    field: 'status',
    render: (row: Partial<CITableBuildInfo>) => {
      return (
        <Box display="flex" alignItems="center">
          <BuildKiteStatus status={row.state} />
        </Box>
      );
    },
  },
  {
    title: 'Tests',
    sorting: false,
    render: (row: Partial<CITableBuildInfo>) => {
      return (
        <>
          <p>
            {row.tests && (
              <Link href={row.tests.testUrl || ''} target="_blank">
                {row.tests.passed} / {row.tests.total} passed
                {/* <FailSkippedWidget
                  skipped={row.tests.skipped}
                  failed={row.tests.failed}
                /> */}
              </Link>
            )}

            {!row.tests && 'n/a'}
          </p>
        </>
      );
    },
  },
  {
    title: 'Actions',
    sorting: false,
    render: (row: Partial<CITableBuildInfo>) => (
      <IconButton onClick={row.onRestartClick}>
        <RetryIcon />
      </IconButton>
    ),
    width: '10%',
  },
];

export const CITableView: FC<TableProps> = ({
  projectName,
  loading,
  pageSize,
  page,
  retry,
  builds,
  onChangePage,
  onChangePageSize,
  total,
}) =>  {
  console.log(builds);
  return (
  <Table
    isLoading={loading}
    options={{ paging: true, pageSize, padding: 'dense' }}
    totalCount={total}
    page={page}
    actions={[
      {
        icon: () => <RetryIcon />,
        tooltip: 'Refresh Data',
        isFreeAction: true,
        onClick: () => retry(),
      },
    ]}
    data={builds ?? []}
    onChangePage={onChangePage}
    onChangeRowsPerPage={onChangePageSize}
    title={
      <Box display="flex" alignItems="center">
        <GitHubIcon />
        <Box mr={1} />
        <Typography variant="h6">{projectName}</Typography>
      </Box>
    }
    columns={generatedColumns}
  />
);
};

const BuildKiteBuildsTable: FC<{entity: Entity}> = ({ entity }) => {
  const { owner, repo } = useProjectEntity(entity);
  const [tableProps, { setPage, retry, setPageSize }] = useBuilds({owner, repo});

  return (
    <CITableView
      {...tableProps}
      retry={ retry }
      onChangePageSize={ setPageSize }
      onChangePage={ setPage }
    />
  );
};

export default BuildKiteBuildsTable;
