import React from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { UserAccount } from '../redux/reducers/userReducer';
import { App } from '../redux/types';
import { setApps, setManageAppGlobalState } from '../redux/actions/actions';
import { FinancialRegulatorPage } from './FinancialRegulatorPage';

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setApps: typeof setApps;
  setManageAppGlobalState: typeof setManageAppGlobalState;
}

interface OwnProps {}


type FinancialRegulatorPageContainerProps = StateProps & DispatchProps & OwnProps;

function FinancialRegulatorPageContainer(props: FinancialRegulatorPageContainerProps) {

  return (
    <FinancialRegulatorPage
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setApps,
  setManageAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FinancialRegulatorPageContainer);
