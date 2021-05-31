import React from 'react';
import BondTimeline from '../common/BondTimeline';
import TextField from '@material-ui/core/TextField';
import AppList from '../common/AppTable';
import { App, Trade } from '../redux/types';
import { BackButton } from '../common/BackButton';
import Typography from '@material-ui/core/Typography';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import BuyContainer from './BuyContainer';
import RegisterContainer from './RegisterContainer';
import ClaimContainer from './ClaimContainer';
import { UserAccount } from '../redux/reducers/userReducer';
import { CouponRound, Defaulted } from './Utils';
import TradeSellContainer from './TradeSellContainer';
import { InvestorPageNav } from './InvestorPageContainer';
import { FETCH_APPS_FILTER, FETCH_MY_TRADES_FILTER, FETCH_TRADES_FILTER } from '../common/Utils';
import { Selection } from './Selection';
import TradeTable from '../common/TradeTable';
import TradeBuyContainer from './TradeBuyContainer';

interface InvestorPageProps {
  investorPageNav: InvestorPageNav;
  enterAppsTable: (filter: FETCH_APPS_FILTER) => Promise<void>;
  exitAppsTable: () => void;
  enterInvestView: (appId: number) => void;
  exitInvestView: () => void;
  enterTradesTable:  (filter: FETCH_TRADES_FILTER) => Promise<void>;
  exitTradesTable: () => void;
  enterTrade: (tradeId: number, app_id: number) => void;
  exitTrade: () => void;
  enterManageTradesTable:  (filter: FETCH_MY_TRADES_FILTER) => Promise<void>;
  exitManageTradesTable: () => void;
  enterManageTrade: (tradeId: number, app_id: number, addr: string) => void;
  exitManageTrade: () => void;
  app?: App;
  trade?: Trade;
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
    enterAppsTable,
    exitAppsTable,
    enterInvestView,
    exitInvestView,
    enterTradesTable,
    exitTradesTable,
    enterTrade,
    exitTrade,
    enterManageTradesTable,
    exitManageTradesTable,
    enterManageTrade,
    exitManageTrade,
    app,
    trade,
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
    <Selection
      enterAppsTable={enterAppsTable}
      enterTradesTable={enterTradesTable}
      enterManageTradesTable={enterManageTradesTable}
    />
  )

  const appsTable = (
    <div>
      <BackButton onClick={exitAppsTable}/>
      <Typography variant="h3">Listed Green Bonds</Typography>
      <AppList onClick={enterInvestView}/>
    </div>
  )

  const tradesTable = (
    <div>
      <BackButton onClick={exitTradesTable}/>
      <Typography variant="h3">Listed Trades</Typography>
      <TradeTable onClick={enterTrade}/>
    </div>
  )

  const manageTradesTable = (
    <div>
      <BackButton onClick={exitManageTradesTable}/>
      <Typography variant="h3">Listed Trades</Typography>
      <TradeTable onClick={enterManageTrade}/>
    </div>
  )

  const appView = app && (
    <>

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

      <TradeSellContainer
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

    </>
  )

  const investAppView = app && (
    <div>
      <BackButton onClick={exitInvestView}/>
      {appView}
    </div>
  )

  const manageAppView = (
    <div>
      <BackButton onClick={exitManageTrade}/>
      {appView}
    </div>
  )

  const tradeAppView = app && trade && (
    <div>

      <BackButton onClick={exitTrade}/>

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

      <Typography variant="h5" gutterBottom>Trade</Typography>

      <TradeBuyContainer app={app} trade={trade} />

    </div>
  )

  return (
    <div className={"page-content"}>
      {investorPageNav === InvestorPageNav.SELECTION ? selection : null}
      {investorPageNav === InvestorPageNav.APPS_TABLE ? appsTable : null}
      {investorPageNav === InvestorPageNav.INVEST ? investAppView : null}
      {investorPageNav === InvestorPageNav.TRADES_TABLE ? tradesTable : null}
      {investorPageNav === InvestorPageNav.TRADE ? tradeAppView : null}
      {investorPageNav === InvestorPageNav.MANAGE_TRADES_TABLE ? manageTradesTable : null}
      {investorPageNav === InvestorPageNav.MANAGE_TRADE ? manageAppView : null}
    </div>
  );
}
