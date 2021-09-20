import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { App, AppFiles, AppState } from '../redux/types';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { IPFSFileList } from './IPFSFileList';
import { getRatingsFromState } from '../investor/Utils';
import { setAppFiles } from '../redux/actions/actions';
import { getAppFilesSelector } from '../redux/selectors/bondSelector';

interface StateProps {
  getAppFiles: (appId: number) => AppFiles;
}

interface DispatchProps {
  setAppFiles: typeof setAppFiles;
}

interface OwnProps {
  app: App | undefined
}


type IPFSFileListContainerProps = StateProps & DispatchProps & OwnProps;

function IPFSFileListContainer(props: IPFSFileListContainerProps) {

  const [ratings, setRatings] = useState<number[]>([]);

  const { app, getAppFiles, setAppFiles } = props;

  useEffect(() => {
    if (!app) return;

    // Get IPFS docs associated with current application
    new IPFSAlgoWrapper().getData(app).then(res => setAppFiles(app.app_id, res));

    // Get ratings
    if (!app.app_global_state) return;
    const newRatings: number[] = getRatingsFromState(app);
    setRatings(newRatings);

  }, [app?.app_id, app?.app_global_state])


  return (
    <>
      {app ?
        (<IPFSFileList
          cids={getAppFiles(app.app_id)}
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
  getAppFiles: getAppFilesSelector(state),
});

const mapDispatchToProps = {
  setAppFiles,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IPFSFileListContainer);
