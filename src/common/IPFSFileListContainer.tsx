import React, { useEffect, useState } from 'react';
import { getManageAppGlobalStateSelector } from '../redux/selectors/bondSelector';
import { connect } from 'react-redux';
import { App, AppState } from '../redux/types';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { IPFSFileList } from './IPFSFileList';
import { getRatingsFromState } from '../investor/Utils';
import { setAppFiles } from '../redux/actions/actions';

interface StateProps {}

interface DispatchProps {
  setAppFiles: typeof setAppFiles;
}

interface OwnProps {
  app: App | undefined
}


type IPFSFileListContainerProps = StateProps & DispatchProps & OwnProps;

function IPFSFileListContainer(props: IPFSFileListContainerProps) {

  const [ratings, setRatings] = useState<number[]>([]);

  const { app, setAppFiles } = props;

  useEffect(() => {
    if (!app) return;

    // Get IPFS docs associated with current application
    new IPFSAlgoWrapper().getData(app).then(res => setAppFiles(app.app_id, res));

    // Get ratings
    const manageAppState: AppState | undefined =  app.manage_app_global_state
    if (!manageAppState) return;
    const newRatings: number[] = getRatingsFromState(app);
    setRatings(newRatings);

  }, [app?.app_id, app?.manage_app_global_state])


  return (
    <>
      {app ?
        (<IPFSFileList
          cids={app.cids ? app.cids : []}
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
  setAppFiles,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IPFSFileListContainer);
