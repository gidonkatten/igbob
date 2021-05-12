import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { appsSelector } from '../redux/selectors/selectors';
import { connect } from 'react-redux';
import { App } from '../redux/reducers/bond';

interface StateProps {
  apps: Map<number, App>;
}

interface DispatchProps {}

interface OwnProps {
  onClick: (appId: number) => void;
}

type AppListProps = StateProps & OwnProps;

function AppList(props: AppListProps) {
  const { apps, onClick } = props;

  return (
    <List component="nav">
      {apps && [...apps].map(([appId, app]) => {
        return (
          <ListItem
            button
            onClick={() => onClick(appId)}
            key={appId}
          >
            <ListItemText primary={app.name} secondary={"App Id: " + app.app_id}/>
          </ListItem>
        )
      })}
    </List>
  );
}

const mapStateToProps = (state) => ({
  apps: appsSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(AppList);