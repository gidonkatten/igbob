import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import GavelIcon from '@material-ui/icons/Gavel';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
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
          style={{ textTransform: 'none', fontSize: '200%' }}
          onClick={() => enterAppsTable(FetchAppsFilter.SALE, BondStatus.SALE)}
        >
          <Grid container>
            <Grid item xs={12}><GavelIcon style={{ fontSize: '300%' }}/></Grid>
            <Grid item xs={12}>Primary Market</Grid>
          </Grid>
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none', fontSize: '200%' }}
          onClick={() => enterAppsTable(FetchAppsFilter.LIVE, BondStatus.ONGOING)}
        >
          <Grid container>
            <Grid item xs={12}><DirectionsWalkIcon style={{ fontSize: '300%' }}/></Grid>
            <Grid item xs={12}>Ongoing Bonds</Grid>
          </Grid>
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none', fontSize: '200%' }}
          onClick={() => enterManageTradesTable(FETCH_MY_TRADES_FILTER.MY_LIVE)}
        >
          <Grid container>
            <Grid item xs={12}><MyLocationIcon style={{ fontSize: '300%' }}/></Grid>
            <Grid item xs={12}>My Live Trades</Grid>
          </Grid>
        </Button>

      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none', fontSize: '200%' }}
          onClick={() => enterTradesTable(FETCH_TRADES_FILTER.LIVE)}
        >
          <Grid container>
            <Grid item xs={12}><SwapHorizIcon style={{ fontSize: '300%' }}/></Grid>
            <Grid item xs={12}>Secondary Market</Grid>
          </Grid>
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none', fontSize: '200%' }}
          onClick={() => enterAppsTable(FetchAppsFilter.EXPIRED, BondStatus.EXPIRED)}
        >
          <Grid container>
            <Grid item xs={12}><DoneIcon style={{ fontSize: '300%' }}/></Grid>
            <Grid item xs={12}>Expired Bonds</Grid>
          </Grid>
        </Button>
      </Grid>

      <Grid item xs={6}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none', fontSize: '200%' }}
            onClick={() => enterTradesTable(FETCH_TRADES_FILTER.EXPIRED)}
          >
            <Grid container>
              <Grid item xs={12}><CancelIcon style={{ fontSize: '300%' }}/></Grid>
              <Grid item xs={12}>Expired Trades</Grid>
            </Grid>
          </Button>
      </Grid>

    </Grid>
  );
}
