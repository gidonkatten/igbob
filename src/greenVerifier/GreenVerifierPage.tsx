import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import AppList from '../common/AppList';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { UserAccount } from '../redux/reducers/userReducer';
import TextField from '@material-ui/core/TextField';
import { App } from '../redux/types';
import { algodClient } from '../algorand/utils/Utils';
import { extractManageAppState } from '../utils/Utils';
import { setManageAppGlobalState } from '../redux/actions/actions';
import { rate } from '../algorand/bond/Rate';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setManageAppGlobalState,
}

interface OwnProps {}


type GreenVerifierPageProps = StateProps & DispatchProps & OwnProps;

function GreenVerifierPage(props: GreenVerifierPageProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();
  const [rating, setRating] = useState<number>(5);

  const {
    selectedAccount,
    getApp,
    setManageAppGlobalState,
  } = props;

  // RATE
  const handleRate = async () => {
    if (!selectedAccount || !app) return;
    await rate(app.manage_app_id, selectedAccount.address, 4, rating);

    algodClient.getApplicationByID(app.manage_app_id).do().then(manageApp => {
      setManageAppGlobalState(app.app_id, extractManageAppState(manageApp.params['global-state']));
    })
  }

  const enterAppView = (appId) => {
    setInOverview(false);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  const appId = app ? app.app_id : 0;
  useEffect(() => {
    if (!app) return;

    algodClient.getApplicationByID(app.manage_app_id).do().then(manageApp => {
      setManageAppGlobalState(app.app_id, extractManageAppState(manageApp.params['global-state']));
    })
  }, [appId])

  const appsList = (
    <div>
      <h3>Listed Green Bonds</h3>
      <AppList
        onClick={enterAppView}
        appFilter={(app: App) => app.green_verifier_address === (selectedAccount ? selectedAccount.address : undefined)}
      />
    </div>
  )

  const appView = app && (
    <div>

      <IconButton onClick={exitAppView}><ArrowBackIcon/></IconButton>

      <Grid container spacing={3} style={{ marginTop: '8px' }}>

        <TextField
          label="Selected Address:"
          defaultValue={selectedAccount ? selectedAccount.address : undefined}
          required
          fullWidth
          InputProps={{ readOnly: true }}
          helperText="Can be changed in settings"
          InputLabelProps={{ required: false }}
          style={{ margin: '8px 0px' }}
        />


        {/*Second Row*/}
        <Grid item xs={5}>
          <FormControl fullWidth>
            <InputLabel>Rating:</InputLabel>
            <Input
              value={rating}
              onChange={e => setRating(parseInt(e.target.value))}
              type="number"
              name="rating"
              fullWidth
              required
              inputProps={{ min: 1, max: 5 }}
            />
          </FormControl>
        </Grid>

        <Grid item xs={7}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none' }}
            onClick={handleRate}
          >
            RATE
          </Button>
        </Grid>
      </Grid>

    </div>
  )

  return (
    <div className={"page-content"}>
      {inOverview ? appsList : appView}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setManageAppGlobalState
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GreenVerifierPage);
