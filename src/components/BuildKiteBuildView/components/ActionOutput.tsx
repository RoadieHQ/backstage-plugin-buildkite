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

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { Progress } from '@backstage/core';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import React, { FC, Suspense } from 'react';
import { useLog } from '../../useLog';

const LazyLog = React.lazy(() => import('react-lazylog/build/LazyLog'));
moment.relativeTimeThreshold('ss', 0);

const useStyles = makeStyles({
  accordion: {
    marginTop: '0!important',
  },
  accordionDetails: {
    padding: 0,
  },
  button: {
    order: -1,
    marginRight: 0,
    marginLeft: '-20px',
  },
});

export const ActionOutput: FC<{
  url: string;
  job: any;
  className: string;
}> = ({ url, job, className }) => {
  const classes = useStyles();
  const splitUrl = url.split('/');
  const { loading, value, error } = useLog({ owner: splitUrl[5], repo: splitUrl[7], buildNumber: parseInt(splitUrl[9], 10), buildId: splitUrl[11] });

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const timeElapsed = moment
    .duration(
      moment(job.finished_at || moment()).diff(moment(job.started_at)),
    )
    .humanize();

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }} className={`${classes.accordion} ${className}`}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${name}-content`}
        id={`panel-${name}-header`}
        IconButtonProps={{
          className: classes.button,
        }}
      >
        <Typography variant="button">
          {job.name || job.command} ({timeElapsed})
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>
        {value.size === 0 ? (
          'Nothing here...'
        ) : (
          <Suspense fallback={<LinearProgress />}>
            <div style={{ height: '30vh', width: '100%' }}>
              <LazyLog text={value.content} extraLines={1} enableSearch />
            </div>
          </Suspense>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
