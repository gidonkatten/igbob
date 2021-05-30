import { DataGrid, GridCellParams } from '@material-ui/data-grid';
import React, { useEffect } from 'react';
import { appsTableSelector } from '../redux/selectors/bondSelector';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { setApps } from '../redux/actions/actions';
import { App, AppsTable, AppsTableElem } from '../redux/types';
import { formatStablecoin } from '../utils/Utils';

interface StateProps {
  appsTable: AppsTable
}

interface DispatchProps {
  setApps: typeof setApps;
}

interface OwnProps {
  onClick: (appId: number) => void;
  appFilter?: (appsTableElem: AppsTableElem) => boolean;
}

type AppListProps = StateProps & DispatchProps & OwnProps;

function AppTable(props: AppListProps) {
  const { appsTable, setApps, onClick, appFilter } = props;

  const { getAccessTokenSilently } = useAuth0();

  async function fetchApps() {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch("https://igbob.herokuapp.com/apps/all-apps", {
        headers: { Authorization: `Bearer ${accessToken}`},
      });
      const parseResponse = await response.json();
      setApps(parseResponse);
    } catch (err) {
      console.error(err.message);
    }
  }

  // fetch apps after initial render
  useEffect( () => {
    fetchApps();
  }, []);

  const renderPrice = (params: GridCellParams) => (
    <>${formatStablecoin(params.value as number)}</>
  );

  return (
    <div style={{ paddingTop: 16, height: '75vh', width: '100%', position: 'relative' }}>
      <DataGrid
        columns={[
          { field: 'bond_id', headerName: 'Bond ID', width: 130, type: 'number' },
          { field: 'name', headerName: 'Name', width: 200 },
          { field: 'start_buy_date', headerName: 'Start Buy', width: 140, type: 'date' },
          { field: 'end_buy_date', headerName: 'End Buy', width: 140, type: 'date' },
          { field: 'maturity_date', headerName: 'Maturity', width: 140, type: 'date' },
          { field: 'bond_cost', headerName: 'Cost', width: 120, type: 'number', renderCell: renderPrice, description: 'Initial cost of bond' },
          { field: 'bond_coupon', headerName: 'Coupon', width: 130, type: 'number', renderCell: renderPrice },
          { field: 'bond_length', headerName: 'Payments', type: 'number', width: 140, description: 'Number of coupon payments' },
          { field: 'bond_principal', headerName: 'Principal', width: 140, type: 'number', renderCell: renderPrice },
        ]}
        rows={appsTable.filter(elem => appFilter ? appFilter(elem) : true)}
        onRowClick={(params) => onClick(params.id as number)}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  appsTable: appsTableSelector(state),
});

const mapDispatchToProps = {
  setApps
}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(AppTable);