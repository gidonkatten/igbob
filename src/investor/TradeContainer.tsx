import React from 'react';
import { connect } from 'react-redux'
import { setMainAppGlobalState, setManageAppGlobalState, setSelectedAccount } from '../redux/actions/actions';
import {
  getAppLocalCouponRoundsPaidSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector,
} from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { UserAccount } from '../redux/reducers/userReducer';
import { App } from '../redux/types';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getBondBalance: (bondId: number) => number | bigint;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalCouponRoundsPaid: (appId: number) => number;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
  setMainAppGlobalState: typeof setMainAppGlobalState,
  setManageAppGlobalState: typeof setManageAppGlobalState;
}

interface OwnProps {}

type TradeProps = StateProps & DispatchProps & OwnProps;

function TradeContainer(props: TradeProps) {

  return (
    <div>

    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getBondBalance: getBondBalanceSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getAppLocalCouponRoundsPaid: getAppLocalCouponRoundsPaidSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setMainAppGlobalState,
  setManageAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TradeContainer);