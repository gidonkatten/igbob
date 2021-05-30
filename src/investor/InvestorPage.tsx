import React from 'react';
import BondTimeline from '../common/BondTimeline';
import TextField from '@material-ui/core/TextField';
import AppList from '../common/AppTable';
import { App } from '../redux/types';
import { BackButton } from '../common/BackButton';
import Typography from '@material-ui/core/Typography';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import BuyContainer from './BuyContainer';
import RegisterContainer from './RegisterContainer';
import ClaimContainer from './ClaimContainer';
import { UserAccount } from '../redux/reducers/userReducer';
import { CouponRound, Defaulted } from './Utils';
import TradeContainer from './TradeContainer';
import { InvestorPageNav } from './InvestorPageContainer';
import { FETCH_APPS_FILTER } from '../common/Utils';

interface InvestorPageProps {
  investorPageNav: InvestorPageNav;
  enterOverview: (filter: FETCH_APPS_FILTER) => Promise<void>;
  exitOverview: () => void;
  enterAppView: (appId: number) => void;
  exitAppView: () => void;
  app?: App;
  selectedAccount?: UserAccount;
  couponRound?: CouponRound;
  defaulted?: Defaulted;
  bondsMinted: number;
  bondEscrowBalance: number | bigint;
  setBondEscrowBalance: (balance: number | bigint) => void;
  stablecoinEscrowBalance: number | bigint;
  setStablecoinEscrowBalance: (balance: number | bigint) => void;
}

export function InvestorPage(props: InvestorPageProps) {

  const {
    investorPageNav,
    enterOverview,
    exitOverview,
    enterAppView,
    exitAppView,
    app,
    selectedAccount,
    couponRound,
    defaulted,
    bondsMinted,
    bondEscrowBalance,
    setBondEscrowBalance,
    stablecoinEscrowBalance,
    setStablecoinEscrowBalance,
  } = props;


  const selection = (
    <div>


    </div>
  )

  const appsList = (
    <div>

      <BackButton onClick={exitOverview}/>

      <Typography variant="h3">Listed Green Bonds</Typography>

      <AppList onClick={enterAppView}/>

    </div>
  )

  const appView = app && (
    <div>

      <BackButton onClick={exitAppView}/>

      <Typography variant="h3" gutterBottom>{app.name}</Typography>

      <Typography variant="body1" gutterBottom>{app.description}</Typography>

      <Typography variant="h4" gutterBottom>Bond Timeline</Typography>

      <BondTimeline
        startBuyDate={app.start_buy_date}
        endBuyDate={app.end_buy_date}
        bondLength={app.bond_length}
        maturityDate={app.maturity_date}
        period={app.period}
      />

      <Typography variant="h4" gutterBottom>Bond Rating</Typography>

      <IPFSFileListContainer app={app}/>

      <Typography variant="h4" gutterBottom>Bond</Typography>

      <TextField
        label="Selected Address:"
        defaultValue={selectedAccount ? selectedAccount.address : undefined}
        required
        fullWidth
        InputProps={{ readOnly: true }}
        helperText="Can be changed in settings"
        InputLabelProps={{ required: false }}
        style={{ margin: '8px 0px' }}
      />

      <Typography variant="h5" gutterBottom>Register</Typography>

      <RegisterContainer app={app}/>

      <Typography variant="h5" gutterBottom>Purchase</Typography>

      <BuyContainer
        app={app}
        setBondEscrowBalance={setBondEscrowBalance}
      />

      <Typography variant="h5" gutterBottom>Trade</Typography>

      <TradeContainer
        app={app}
      />

      <Typography variant="h5" gutterBottom>Claim Money</Typography>

      <ClaimContainer
        app={app}
        couponRound={couponRound}
        defaulted={defaulted}
        bondsMinted={bondsMinted}
        bondEscrowBalance={bondEscrowBalance}
        setBondEscrowBalance={setBondEscrowBalance}
        stablecoinEscrowBalance={stablecoinEscrowBalance}
        setStablecoinEscrowBalance={setStablecoinEscrowBalance}
      />

    </div>
  )

  return (
    <div className={"page-content"}>
      {investorPageNav === InvestorPageNav.SELECTION ? null : null}
      {investorPageNav === InvestorPageNav.OVERVIEW ? appsList : null}
      {investorPageNav === InvestorPageNav.INVEST ? appView : null}
    </div>
  );
}
