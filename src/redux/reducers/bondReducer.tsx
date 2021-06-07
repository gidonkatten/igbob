import { App, Trade } from '../types';

interface BondState {
  apps: Map<number, App>;
  trades: Map<number, Trade>;
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
    case "SET_TRADES": {
      const { trades } = action.payload;
      const tradesMap = new Map<number, Trade>(trades.map(trade => [trade.trade_id, trade]));
      return {
        ...state,
        trades: tradesMap
      };
    }
    case "SET_TRADE_AVAILABLE_BALANCE": {
      const { tradeId, balance, frozen } = action.payload;
      const tradesMap = state.trades;
      const trade = tradesMap.get(tradeId);

      if (!trade) return state;

      trade.seller_balance = balance;
      trade.seller_frozen = frozen;

      return {
        ...state,
        trades: tradesMap
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
    case "SET_MANAGE_APP_GLOBAL_STATE": {
      const { appId, appState } = action.payload;
      const appsMap = state.apps;

      if (!appsMap.has(appId)) return state;

      appsMap.get(appId)!.manage_app_global_state = appState;
      return {
        ...state,
        apps: appsMap
      };
    }
    default:
      return state;
  }
}
