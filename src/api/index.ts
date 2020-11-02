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

import { createApiRef, DiscoveryApi } from '@backstage/core';

export const buildKiteApiRef = createApiRef<BuildKiteApi>({
  id: 'plugin.buildkite.service',
  description: 'Used by the BuildKite plugin to make requests',
});

const DEFAULT_PROXY_PATH = '/buildkite/api';

type Options = {
  discoveryApi: DiscoveryApi;
  /**
   * Path to use for requests via the proxy, defaults to /buildkite/api
   */
  proxyPath?: string;
};

export class BuildKiteApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}${this.proxyPath}`;
  }

  async getBuilds(page: number, per_page: number) {
    const url = await this.getApiUrl();
    const request = await fetch(`${url}/builds?page=${page}&per_page=${per_page}`);
    return request.json();
  }

  async restartBuild(orgSlug: string, pipelineSlug: string, buildNumber: number) {
    const url = await this.getApiUrl();
    const request = await fetch(`${url}/organizations/${orgSlug}/pipelines/${pipelineSlug}/builds/${buildNumber}/rebuild`, {
      method: 'PUT',
    });
    return request.json();
  }

  async getSingleBuild(orgSlug: string, pipelineSlug: string, buildNumber: number) {
    const url = await this.getApiUrl();
    const request = await fetch(`${url}/organizations/${orgSlug}/pipelines/${pipelineSlug}/builds/${buildNumber}`);
    return request.json();
  }

  async getLog(orgSlug: string, pipelineSlug: string, buildNumber: number, buildId: string) {
    const url = await this.getApiUrl();
    const request = await fetch(`${url}/organizations/${orgSlug}/pipelines/${pipelineSlug}/builds/${buildNumber}/jobs/${buildId}/log`);
    return request.json();  
  }
}
