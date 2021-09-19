import { App, Trade } from '../types';

interface BondState {
  apps: Map<number, App>;
  selectedApp?: number;
  trades: Map<number, Trade>;
  selectedTrade?: number;
}

const initialState: BondState = {
  apps: new Map<number, App>(),
  trades: new Map<number, Trade>(),
};

export function bondReducer(state = initialState, action: any) {
  switch (action.type) {
    case "SET_APPS": {
      const { apps } = action.payload;
      const appsMap = new Map<number, App>(apps.map(app => [app.app_id, app]));
      return {
        ...state,
        apps: appsMap
      };
    }
    case "CLEAR_SELECTED_APP": {
      return {
        ...state,
        selectedApp: undefined
      };
    }
    case "SET_SELECTED_APP": {
      const { appId } = action.payload;
      return {
        ...state,
        selectedApp: appId
      };
    }
    case "SET_APP_BOND_ESCROW_BALANCE": {
      const { appId, balance } = action.payload;
      const appsMap = state.apps;
      const app = appsMap.get(appId);

      if (!app) return state;

      app.bond_escrow_balance = balance;
      appsMap.set(appId, app);

      return {
        ...state,
        apps: appsMap
      };
    }
    case "SET_APP_STABLECOIN_ESCROW_BALANCE": {
      const { appId, balance } = action.payload;
      const appsMap = state.apps;
      const app = appsMap.get(appId);

      if (!app) return state;

      app.stablecoin_escrow_balance = balance;
      appsMap.set(appId, app);

      return {
        ...state,
        apps: appsMap
      };
    }
    case "SET_APP_DEFAULTED": {
      const { appId, defaulted } = action.payload;
      const appsMap = state.apps;
      const app = appsMap.get(appId);

      if (!app) return state;

      app.defaulted = defaulted;
      appsMap.set(appId, app);

      return {
        ...state,
        apps: appsMap
      };
    }
    case "SET_APP_FILES": {
      const { appId, files } = action.payload;
      const appsMap = state.apps;
      const app = appsMap.get(appId);

      if (!app) return state;

      app.cids = files;
      appsMap.set(appId, app);

      return {
        ...state,
        apps: appsMap
      };
    }
    case "SET_MAIN_APP_GLOBAL_STATE": {
      const { appId, appState } = action.payload;
      const appsMap = state.apps;

      if (!appsMap.has(appId)) return state;

      appsMap.get(appId)!.app_global_state = appState;
      return {
        ...state,
        apps: appsMap
      };
    }
    case "SET_TRADES": {
      const { trades } = action.payload;
      const tradesMap = new Map<number, Trade>(trades.map(trade => [trade.trade_id, trade]));
      return {
        ...state,
        trades: tradesMap
      };
    }
    case "CLEAR_SELECTED_TRADE": {
      return {
        ...state,
        selectedTrade: undefined
      };
    }
    case "SET_SELECTED_TRADE": {
      const { tradeId } = action.payload;
      return {
        ...state,
        selectedTrade: tradeId
      };
    }
    case "SET_TRADE_AVAILABLE_BALANCE": {
      const { tradeId, balance, frozen } = action.payload;
      const tradesMap = state.trades;
      const trade = tradesMap.get(tradeId);

      if (!trade) return state;

      trade.seller_balance = balance;
      trade.seller_frozen = frozen;
      tradesMap.set(tradeId, trade);

      return {
        ...state,
        trades: tradesMap
      };
    }
    default:
      return state;
  }
}
