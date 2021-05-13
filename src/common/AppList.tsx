import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React, { useEffect } from 'react';
import { appsSelector } from '../redux/selectors/bondSelector';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { setApps } from '../redux/actions/actions';
import { App } from '../redux/types';

interface StateProps {
  apps: Map<number, App>;  // appId -> App
}

interface DispatchProps {
  setApps: typeof setApps;
}

interface OwnProps {
  onClick: (appId: number) => void;
  appFilter?: (app: App) => boolean;
}

type AppListProps = StateProps & DispatchProps & OwnProps;

function AppList(props: AppListProps) {
  const { apps, setApps, onClick, appFilter } = props;

  const { getAccessTokenSilently } = useAuth0();

  async function fetchApps() {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch("https://igbob.herokuapp.com/apps/all-apps", {
        headers: { Authorization: `Bearer ${accessToken}`},
      });
      const parseResponse = await response.json();
      setApps(parseResponse);
    } catch (err) {
      console.error(err.message);
    }
  }

  // fetch apps after initial render
  useEffect( () => {
    fetchApps();
  }, []);

  return (
    <List component="nav">
      {apps && [...apps]
        .filter(([, app]) => appFilter ? appFilter(app) : true)
        .map(([appId, app]) => {
          return (
            <ListItem
              button
              onClick={() => onClick(appId)}
              key={appId}
            >
              <ListItemText primary={app.name} secondary={"App Id: " + app.app_id}/>
            </ListItem>
          )
        })
      }
    </List>
  );
}

const mapStateToProps = (state) => ({
  apps: appsSelector(state),
});

const mapDispatchToProps = {
  setApps
}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(AppList);