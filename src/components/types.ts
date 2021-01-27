import * as t from 'io-ts';

export const buildkiteJob = t.type({
  state: t.string,
  log_url: t.string,
  id: t.string,
});

export const buildkiteBuildInfo = t.type({
  id: t.string,
  number: t.number,
  message: t.string,
  branch: t.string,
  commit: t.string,
  pipeline: t.type({
    provider: t.type({ repository: t.union([t.string, t.undefined]) }),
    slug: t.string,
  }),
  created_at: t.string,
  state: t.string,
  rebuilt_from: t.union([
    t.type({
      id: t.string,
    }),
    t.null,
  ]),
  url: t.string,
  web_url: t.string,
  jobs: t.array(buildkiteJob),
});

export type BuildkiteBuildInfo = t.TypeOf<typeof buildkiteBuildInfo>;

export const buildkiteBuildInfoList = t.array(buildkiteBuildInfo);

export type BuildkiteBuildInfoList = t.TypeOf<typeof buildkiteBuildInfoList>;

export type TableBuildkiteBuildInfo = BuildkiteBuildInfo & {
  onRestartClick: () => void;
};

export type BuildkiteJob = t.TypeOf<typeof buildkiteJob>;

export type TableProps = {
  loading: boolean;
  retry: () => void;
  builds: BuildkiteBuildInfo[];
  projectName: string;
  page: number;
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
};
