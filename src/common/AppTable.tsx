import { DataGrid, GridCellParams, GridColumns } from '@material-ui/data-grid';
import React from 'react';
import { appsTableSelector } from '../redux/selectors/bondSelector';
import { connect } from 'react-redux';
import { AppsTable } from '../redux/types';
import { BondStatus } from './Utils';
import { formatAlgoDecimalNumber } from '../utils/Utils';
import Rating from '@material-ui/lab/Rating';

interface StateProps {
  appsTable: AppsTable
}

interface DispatchProps {}

interface OwnProps {
  onClick: (appId: number) => void;
  bondStatus?: BondStatus;
}

type AppListProps = StateProps & DispatchProps & OwnProps;

function AppTable(props: AppListProps) {
  const { appsTable, onClick, bondStatus } = props;

  const renderPrice = (params: GridCellParams) => (
    <>${params.value as number}</>
  );

  const renderAlgoNumber = (params: GridCellParams) => (
    <>{formatAlgoDecimalNumber(params.value as number)}</>
  );

  const renderAlgoNumberPrice = (params: GridCellParams) => (
    <>${formatAlgoDecimalNumber(params.value as number)}</>
  );

  const renderStars = (params: GridCellParams) => (
    <Rating
      name="read-only"
      size="small"
      value={params.value as number}
      style={{ paddingRight: '16px' }}
      disabled={(params.value as number) === 0}
      readOnly
    />
  );

  const commonColumns: GridColumns = [
    { field: 'bond_id', headerName: 'Bond ID', width: 130, type: 'number' },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'start_buy_date', headerName: 'Start Buy', width: 140, type: 'date' },
    { field: 'end_buy_date', headerName: 'End Buy', width: 140, type: 'date' },
    { field: 'maturity_date', headerName: 'Maturity', width: 140, type: 'date' },
    { field: 'use_of_proceeds_rating', headerName: 'Proceeds Rating', width: 190, type: 'number', renderCell: renderStars },
    { field: 'recent_rating', headerName: 'Recent Rating', width: 190, type: 'number', renderCell: renderStars },
    { field: 'frozen', headerName: 'Frozen', width: 120, type: 'boolean' },
    { field: 'bond_cost', headerName: 'Cost', width: 120, type: 'number', renderCell: renderPrice, description: 'Initial cost of one bond' },
    { field: 'bond_coupon', headerName: 'Coupon', width: 130, type: 'number', renderCell: renderPrice },
    { field: 'bond_principal', headerName: 'Principal', width: 140, type: 'number', renderCell: renderPrice },
    { field: 'bond_length', headerName: 'Coupons', type: 'number', width: 140, description: 'Number of coupon payments' },

  ]

  const getColumns: () => GridColumns = () => {
    switch (bondStatus) {
      case BondStatus.SALE:
        commonColumns.push({
          field: 'bonds_available', headerName: 'Bonds Available', width: 180, type: 'number', renderCell: renderAlgoNumber
        });
        commonColumns.push({
          field: 'bonds_minted', headerName: 'Bonds Minted', width: 170, type: 'number', renderCell: renderAlgoNumber
        });
        break;
      // @ts-ignore
      case BondStatus.ONGOING:
        commonColumns.push({
          field: 'coupon_round', headerName: 'Coupons Payed', width: 180, type: 'number',
        });
        // fall through
      case BondStatus.EXPIRED:
        commonColumns.push({
          field: 'stablecoin_escrow_balance', headerName: 'Funds', width: 180, type: 'number', renderCell: renderAlgoNumberPrice
        });
        commonColumns.push({
          field: 'defaulted', headerName: 'Defaulted', width: 140, type: 'boolean',
        });
        break;
      default:
        break;
    }
    return commonColumns;
  }

  return (
    <div style={{ paddingTop: 16, height: '75vh', width: '100%', position: 'relative' }}>
      <DataGrid
        columns={getColumns()}
        rows={appsTable}
        onRowClick={(params) => onClick(params.id as number)}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  appsTable: appsTableSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(AppTable);