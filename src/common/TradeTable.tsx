import { DataGrid, GridCellParams } from '@material-ui/data-grid';
import React from 'react';
import { tradesTableSelector } from '../redux/selectors/bondSelector';
import { connect } from 'react-redux';
import { TradesTable } from '../redux/types';
import { formatAlgoDecimalNumber } from '../utils/Utils';

interface StateProps {
  tradesTable: TradesTable
}

interface DispatchProps {}

interface OwnProps {
  onClick: (tradeId: number, appId: number, addr: string) => void;
}

type TradeTableProps = StateProps & DispatchProps & OwnProps;

function TradeTable(props: TradeTableProps) {
  const { tradesTable, onClick } = props;

  const renderPrice = (params: GridCellParams) => (
    <>${params.value as number}</>
  );

  const renderAlgoNumber = (params: GridCellParams) => (
    <>{formatAlgoDecimalNumber(params.value as number)}</>
  );

  return (
    <div style={{ paddingTop: 16, height: '75vh', width: '100%', position: 'relative' }}>
      <DataGrid
        columns={[
          { field: 'trade_id', headerName: 'Trade ID', width: 130, type: 'number' },
          { field: 'bond_id', headerName: 'Bond ID', width: 130, type: 'number' },
          { field: 'app_id', headerName: 'App ID', width: 130, type: 'number', hide: true },
          { field: 'name', headerName: 'Name', width: 200 },
          { field: 'price', headerName: 'Price', width: 130, type: 'number', renderCell: renderPrice, description: 'Price per bond' },
          { field: 'expiry_date', headerName: 'Expiry', width: 130, type: 'date', description: 'Trade offer expiry date' },
          { field: 'maturity_date', headerName: 'Maturity', width: 130, type: 'date' },
          { field: 'bond_coupon', headerName: 'Coupon', width: 130, type: 'number', renderCell: renderPrice },
          { field: 'bond_length', headerName: 'Payments', width: 140, type: 'number', description: 'Number of coupon payments' },
          { field: 'bond_principal', headerName: 'Principal', width: 140, type: 'number', renderCell: renderPrice },
          { field: 'seller_balance', headerName: 'Bonds Available', width: 180, type: 'number', renderCell: renderAlgoNumber },
          { field: 'seller_frozen', headerName: 'Frozen', width: 120, type: 'boolean' },
          { field: 'seller_address', headerName: 'Seller Address', width: 550, hide: true },
        ]}
        rows={tradesTable}
        onRowClick={(params) => onClick(params.row.trade_id, params.row.app_id, params.row.seller_address)}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  tradesTable: tradesTableSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TradeTable);