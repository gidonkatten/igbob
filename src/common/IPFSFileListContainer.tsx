import React, { useEffect, useState } from 'react';
import { extractManageAppState } from '../utils/Utils';
import { getManageAppGlobalStateSelector } from '../redux/selectors/bondSelector';
import { setManageAppGlobalState } from '../redux/actions/actions';
import { connect } from 'react-redux';
import { App, ManageAppState } from '../redux/types';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { algodClient } from '../algorand/utils/Utils';
import { IPFSFileList } from './IPFSFileList';

interface StateProps {
  getManageAppGlobalState: (appId: number) => ManageAppState | undefined;
}

interface DispatchProps {
  setManageAppGlobalState: typeof setManageAppGlobalState,
}

interface OwnProps {
  app: App | undefined
}


type IPFSFileListContainerProps = StateProps & DispatchProps & OwnProps;

function IPFSFileListContainer(props: IPFSFileListContainerProps) {

  const [cids, setCids] = useState<{ cid: string, time: number }[][]>([]);
  const [ratings, setRatings] = useState<number[]>([]);

  const {
    app,
    getManageAppGlobalState,
    setManageAppGlobalState,
  } = props;

  const appId = app ? app.app_id : 0;
  useEffect(() => {
    if (!app) return;

    // Get IPFS docs associated with current application
    const ipfs = new IPFSAlgoWrapper();
    ipfs.getData(app.issuer_address, app.manage_app_id, app.bond_length).then(res => {
      setCids(res);
    });

    // Get global state of current manage application
    algodClient.getApplicationByID(app.manage_app_id).do().then(manageApp => {
      setManageAppGlobalState(app.app_id, extractManageAppState(manageApp.params['global-state']));

      // Update ratings
      const manageAppState: ManageAppState | undefined =  getManageAppGlobalState(app.app_id);
      if (!manageAppState) return;
      const newRatings: number[] = [];
      for (let i = 0; i <= app.bond_length; i++) {
        const key = Math.floor(i / 8);
        const slot = i % 8;
        const array: Uint8Array =  manageAppState.has(key) ? manageAppState.get(key)! : new Uint8Array(8);
        newRatings.push(array[slot]);
      }
      setRatings(newRatings);
    });

  }, [appId])


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
  setManageAppGlobalState
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IPFSFileListContainer);
