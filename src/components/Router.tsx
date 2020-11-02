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
import { Routes, Route } from 'react-router';
import { buildKiteRouteRef, buildKiteBuildRouteRef } from './routeRefs';
import { Entity } from '@backstage/catalog-model';
import { MissingAnnotationEmptyState } from '@backstage/core';
import BuildKiteBuildsTable from './BuildKiteBuildsTable';
import BuildKiteBuildView from './BuildKiteBuildView';
import { BUILDKITE_ANNOTATION } from '../consts';

export const isPluginApplicableToEntity = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[BUILDKITE_ANNOTATION]);

export const Router = ({ entity }: { entity: Entity }) =>
  !isPluginApplicableToEntity(entity) ? (
    <MissingAnnotationEmptyState annotation={BUILDKITE_ANNOTATION} />
  ) : (
    <Routes>
      <Route path={`/${buildKiteRouteRef.path}`} element={<BuildKiteBuildsTable entity={ entity } />} />
      <Route
        path={`/${buildKiteBuildRouteRef.path}`}
        element={<BuildKiteBuildView entity={ entity } />}
      />
    </Routes>
  );
