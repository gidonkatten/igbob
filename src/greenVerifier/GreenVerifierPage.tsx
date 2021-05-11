import React from 'react';
import { connect } from 'react-redux';
import { appsSelector, getAppSelector } from '../redux/selectors/selectors';
import { App } from '../redux/reducers/bond';

interface GreenVerifierPageProps {
  apps: Map<number, App>;
  getApp: (appId: number) => App | undefined;
}

function GreenVerifierPage(props: GreenVerifierPageProps) {

  const { apps, getApp } = props;

  return (
    <div/>
  );
}

const mapStateToProps = (state: any) => ({
  apps: appsSelector(state),
  getApp: getAppSelector(state),
});

export default connect(mapStateToProps, undefined)(GreenVerifierPage);
