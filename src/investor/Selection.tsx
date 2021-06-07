import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import React from 'react';
import { BondStatus, FetchAppsFilter, FETCH_MY_TRADES_FILTER, FETCH_TRADES_FILTER } from '../common/Utils';

interface SelectionProps {
  enterAppsTable: (filter: FetchAppsFilter, bondStatus: BondStatus) => Promise<void>;
  enterTradesTable: (filter: FETCH_TRADES_FILTER) => Promise<void>;
  enterManageTradesTable: (filter: FETCH_MY_TRADES_FILTER) => Promise<void>;
}

export function Selection(props: SelectionProps) {

  const { enterAppsTable, enterTradesTable, enterManageTradesTable } = props;

  return (
    <Grid container spacing={3}>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={() => enterAppsTable(FetchAppsFilter.SALE, BondStatus.SALE)}
        >
          Bonds For Sale
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={() => enterAppsTable(FetchAppsFilter.LIVE, BondStatus.ONGOING)}
        >
          Ongoing Bonds
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={() => enterManageTradesTable(FETCH_MY_TRADES_FILTER.MY_LIVE)}
        >
          My Live Trade Offers
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={() => enterTradesTable(FETCH_TRADES_FILTER.LIVE)}
        >
          Live Trade Offers
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={() => enterAppsTable(FetchAppsFilter.EXPIRED, BondStatus.EXPIRED)}
        >
          Expired Bonds
        </Button>
      </Grid>

      <Grid item xs={6}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none' }}
            onClick={() => enterTradesTable(FETCH_TRADES_FILTER.EXPIRED)}
          >
            Expired Trade Offers
          </Button>
      </Grid>

    </Grid>
  );
}
