import React from 'react';
import { AppAccount } from '../redux/types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { formatAlgoDecimalNumber } from '../utils/Utils';

interface AppAccountListProps {
  appAccounts: AppAccount[];
  freezeAddress: (toFreeze: boolean, addr: string) => void;
}

export function AppAccountList(props: AppAccountListProps) {

  const { appAccounts, freezeAddress } = props;

  return (
    <List>
      {appAccounts.map(appAcc => {
        return (
          <ListItem key={appAcc.addr}>

            <ListItemText
              primary={appAcc.addr}
              secondary={"Bond Balance: " + formatAlgoDecimalNumber(appAcc.balance)}
            />

            <ListItemSecondaryAction>
              <FormControlLabel
                control={
                  <Switch
                    edge="end"
                    onChange={() => freezeAddress(!appAcc.frozen, appAcc.addr)}
                    checked={appAcc.frozen}
                  />
                }
                label={appAcc.frozen ? "Unfreeze" : "Freeze"}
                labelPlacement="top"
              />
            </ListItemSecondaryAction>

          </ListItem>
        )
      })}
    </List>
  )
}
