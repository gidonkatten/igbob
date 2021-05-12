import React, { useState } from 'react';
import { connect } from 'react-redux';
import { appsSelector, getAppSelector } from '../redux/selectors/selectors';
import { App } from '../redux/reducers/bond';
import AppList from '../common/AppList';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

interface GreenVerifierPageProps {
  apps: Map<number, App>;
  getApp: (appId: number) => App | undefined;
}

function GreenVerifierPage(props: GreenVerifierPageProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();

  const { apps, getApp } = props;

  const enterAppView = (appId) => {
    setInOverview(false);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  const appsList = (
    <div>
      <h3>Listed Green Bonds</h3>
      <AppList onClick={enterAppView}/>
    </div>
  )

  const appView = app && (
    <div>
      <IconButton onClick={exitAppView}><ArrowBackIcon/></IconButton>
    </div>
  )

  return (
    <div className={"page-content"}>
      {inOverview ? appsList : appView}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  apps: appsSelector(state),
  getApp: getAppSelector(state),
});

export default connect(mapStateToProps, undefined)(GreenVerifierPage);
