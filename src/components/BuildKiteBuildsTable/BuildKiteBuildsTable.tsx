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
import { generatePath, Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Link, Typography, Tooltip } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
import SyncIcon from '@material-ui/icons/Sync';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Entity } from '@backstage/catalog-model';
import moment from 'moment';
import { buildKiteBuildRouteRef } from '../routeRefs';
import { useBuilds } from '../useBuilds';
import { useProjectEntity } from '../useProjectEntity';
import { BuildkiteStatus } from './components/BuildKiteRunStatus';
import { BuildkiteBuildInfo, TableProps } from '../types';

const getElapsedTime = (start: string) => {
  return moment(start).fromNow();
};

const generatedColumns: TableColumn[] = [
  {
    title: 'Id',
    field: 'number',
    highlight: true,
    width: '5%',
    render: (row: Partial<BuildkiteBuildInfo>) => {
      return row.number;
    },
  },
  {
    title: 'Build',
    field: 'message',
    highlight: true,
    render: (row: Partial<BuildkiteBuildInfo>) => {
      return (
        <p>
          {row.rebuilt_from?.id && 'retry of: '}
          <Link
            component={RouterLink}
            to={generatePath(buildKiteBuildRouteRef.path, {
              buildNumber: (row.number as number).toString(),
            })}
          >
            {row.message}
          </Link>
        </p>
      );
    },
  },
  {
    title: 'Source',
    field: 'commit',
    render: (row: Partial<BuildkiteBuildInfo>) => (
      <>
        <p>{row.branch}</p>
        <p>{row.commit}</p>
      </>
    ),
    width: '45%',
  },
  {
    title: 'Status',
    field: 'state',
    render: (row: Partial<BuildkiteBuildInfo>) => {
      return (
        <Box display="flex" alignItems="center">
          <BuildkiteStatus status={row.state} />
        </Box>
      );
    },
  },
  {
    title: 'Created',
    render: (row: Partial<BuildkiteBuildInfo>) => {
      return getElapsedTime(row.created_at as string);
    },
  },
  {
    title: 'Actions',
    sorting: false,
    render: (row: Partial<BuildkiteBuildInfo>) => (
      <Tooltip title="Rebuild">
        <IconButton onClick={row.onRestartClick}>
          <SyncIcon />
        </IconButton>
      </Tooltip>
    ),
    width: '5%',
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
}) => (
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
    onPageChange={onChangePage}
    onRowsPerPageChange={onChangePageSize}
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

const BuildkiteBuildsTable: FC<{ entity: Entity }> = ({ entity }) => {
  const { owner, repo } = useProjectEntity(entity);
  const [tableProps, { setPage, retry, setPageSize }] = useBuilds({
    owner,
    repo,
  });

  return (
    <CITableView
      {...tableProps}
      retry={retry}
      onChangePageSize={setPageSize}
      onChangePage={setPage}
    />
  );
};

export default BuildkiteBuildsTable;
