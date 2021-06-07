import React, { useEffect, useState } from 'react';
import { getManageAppGlobalStateSelector } from '../redux/selectors/bondSelector';
import { connect } from 'react-redux';
import { App, AppState } from '../redux/types';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { IPFSFileList } from './IPFSFileList';
import { getStateValue } from '../investor/Utils';

interface StateProps {}

interface DispatchProps {}

interface OwnProps {
  app: App | undefined
}


type IPFSFileListContainerProps = StateProps & DispatchProps & OwnProps;

function IPFSFileListContainer(props: IPFSFileListContainerProps) {

  const [cids, setCids] = useState<{ cid: string, time: number }[][]>([]);
  const [ratings, setRatings] = useState<number[]>([]);

  const { app } = props;

  const appId = app ? app.app_id : 0;
  useEffect(() => {
    if (!app) return;

    // Get IPFS docs associated with current application
    new IPFSAlgoWrapper().getData(app).then(res => setCids(res));

    // Get ratings
    const manageAppState: AppState | undefined =  app.manage_app_global_state
    if (!manageAppState) return;
    const newRatings: number[] = [];
    for (let i = 0; i <= app.bond_length; i++) {
      const key: string = Math.floor(i / 8) + '';
      const slot = i % 8;
      const array: Uint8Array | number = getStateValue(key, manageAppState);
      if (array === 0) {
        // Uninitialised array
        newRatings.push(0)
      } else {
        newRatings.push(array[slot]);
      }
    }
    setRatings(newRatings);

  }, [appId, app?.manage_app_global_state])


  return (
    <>
      {app ?
        (<IPFSFileList
          cids={cids}
          ratings={ratings}
          startBuyDate={app.start_buy_date}
          endBuyDate={app.end_buy_date}
          bondLength={app.bond_length}
          maturityDate={app.maturity_date}
          period={app.period}
        />) :
        null
      }
    </>
  )
}

const mapStateToProps = (state: any) => ({
  getManageAppGlobalState: getManageAppGlobalStateSelector(state)
});

const mapDispatchToProps = {
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IPFSFileListContainer);
