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

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  ApiRegistry,
  ApiProvider,
  errorApiRef,
  UrlPatternDiscovery,
} from '@backstage/core';
import { rest } from 'msw';
import { msw } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { buildsResponseMock, entityMock } from '../../mocks/mocks';
import { buildKiteApiRef } from '../..';
import { BuildkiteApi } from '../../api';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import BuildkiteBuildsTable from './BuildKiteBuildsTable';

const postMock = jest.fn();

const errorApiMock = { post: postMock, error$: jest.fn() };
const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');

const apis = ApiRegistry.from([
  [errorApiRef, errorApiMock],
  [buildKiteApiRef, new BuildkiteApi({ discoveryApi })],
]);

describe('BuildKiteBuildsTable', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => jest.resetAllMocks());

  it('should display a table with the data from the requests', async () => {
    worker.use(
      rest.get(
        ' http://exampleapi.com/buildkite/api/organizations/rbnetwork/pipelines/example-pipeline/builds?page=1&per_page=5',
        (_, res, ctx) => res(ctx.json(buildsResponseMock))
      )
    );
    const rendered = render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <ApiProvider apis={apis}>
            <BuildkiteBuildsTable entity={entityMock} />
          </ApiProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(
      await rendered.findByText('rbnetwork/example-pipeline')
    ).toBeInTheDocument();
    expect(
      await rendered.findByText('Update catalog-info.yaml')
    ).toBeInTheDocument();
    expect((await rendered.findAllByText('Queued')).length).toEqual(5);
    expect((await rendered.findAllByText('main')).length).toEqual(5);
  });

  it('should display an error on fetch failure', async () => {
    worker.use(
      rest.get(
        ' http://exampleapi.com/buildkite/api/organizations/rbnetwork/pipelines/example-pipeline/builds?page=1&per_page=5',
        (_, res, ctx) => res(ctx.status(403))
      )
    );
    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <ApiProvider apis={apis}>
            <BuildkiteBuildsTable entity={entityMock} />
          </ApiProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(postMock).toBeCalledWith(
        new Error('failed to fetch data, status 403: Forbidden')
      )
    );
  });
});
