import { DataGrid, GridCellParams } from '@material-ui/data-grid';
import React from 'react';
import { tradesTableSelector } from '../redux/selectors/bondSelector';
import { connect } from 'react-redux';
import { TradesTable } from '../redux/types';
import { formatStablecoin } from '../utils/Utils';

interface StateProps {
  tradesTable: TradesTable
}

interface DispatchProps {}

interface OwnProps {
  onClick: (tradeId: number, appId: number) => void;
}

type TradeTableProps = StateProps & DispatchProps & OwnProps;

function TradeTable(props: TradeTableProps) {
  const { tradesTable, onClick } = props;

  const renderPrice = (params: GridCellParams) => (
    <>${formatStablecoin(params.value as number)}</>
  );

  return (
    <div style={{ paddingTop: 16, height: '75vh', width: '100%', position: 'relative' }}>
      <DataGrid
        columns={[
          { field: 'trade_id', headerName: 'Trade ID', width: 130, type: 'number' },
          { field: 'bond_id', headerName: 'Bond ID', width: 130, type: 'number' },
          { field: 'name', headerName: 'Name', width: 200 },
          { field: 'price', headerName: 'Price', width: 200, type: 'number', description: 'Price per bond' },
          { field: 'expiry', headerName: 'Expiry', width: 200, type: 'date', description: 'Trade offer expiry date' },
          { field: 'maturity_date', headerName: 'Maturity', width: 140, type: 'date' },
          { field: 'bond_coupon', headerName: 'Coupon', width: 130, type: 'number', renderCell: renderPrice },
          { field: 'bond_length', headerName: 'Payments', type: 'number', width: 140, description: 'Number of coupon payments' },
          { field: 'bond_principal', headerName: 'Principal', width: 140, type: 'number', renderCell: renderPrice },
        ]}
        rows={tradesTable}
        onRowClick={(params) => console.log(params)}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  tradesTable: tradesTableSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TradeTable);