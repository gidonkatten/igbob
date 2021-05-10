import React from 'react';
import { connect } from 'react-redux';
import MyAlgoGetAccounts from '../algorand/wallet/myAlgo/MyAlgoGetAccounts';
import { setSelectedAccount } from '../redux/actions/actions';
import { UserAccount } from '../redux/reducers/user';
import { getAccountInformation } from '../algorand/balance/Balance';
import Button from '@material-ui/core/Button';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';
import { STABLECOIN_ID } from '../algorand/utils/Utils';
import { addressesSelector, optedIntoStablecoinSelector, selectedAccountSelector } from '../redux/selectors/selectors';

interface SettingsPageProps {
  addresses: string[];
  selectedAccount?: UserAccount;
  optedIntoStablecoin: boolean;
  setSelectedAccount: typeof setSelectedAccount,
}

function SettingsPage(props: SettingsPageProps) {
  const { addresses, selectedAccount, optedIntoStablecoin, setSelectedAccount } = props;

  const addressesListed = (
    <ul>
      {addresses.map((addr) => {
        return <li key={addr}>Address: {addr}</li>
      })}
    </ul>
  )

  async function onSelectAddress(address: string) {
    if (address) {
      const userAccount = await getAccountInformation(address);
      setSelectedAccount(userAccount);
    }
  }

  const selectAddress = (
    <select value={selectedAccount?.address} onChange={e => onSelectAddress(e.target.value)}>
      {addresses.map((addr) => {
        return <option key={addr} value={addr}>{addr}</option>
      })}
    </select>
  )

  const handleStablecoinOptIn = async () => {
    if (!selectedAccount) return;
    await optIntoAsset(STABLECOIN_ID, selectedAccount.address)
  }

  return (
    <div className={"page-content"}>

      <h3>Instructions</h3>
      <p>
        Connect accounts by creating a &nbsp;
        <a
          href="https://wallet.myalgo.com/home"
          target="_blank"
          rel="noopener noreferrer"
        >
          MyAlgo Account
        </a>
        &nbsp; and adding TestNet Wallets. When you are done, use the button
        below and choose which addresses you want to be able to interact with
        the application from.
      </p>
      <p>
        Note that you can edit which accounts are connected by disconnecting
        from this site on MyAlgo and reconnecting using the button below.
      </p>

      <h3>Connected Account</h3>
      {addresses.length > 0 ?
        addressesListed :
        <p>No addresses</p>
      }
      <p><MyAlgoGetAccounts/></p>

      <h3>Selected Address</h3>
      {addresses.length > 0 ?
        selectAddress :
        <p>No addresses</p>
      }

      {selectedAccount && !optedIntoStablecoin && (
        <>
          <h3>Opt into stablecoin</h3>
          <Button variant="contained" color="primary" onClick={handleStablecoinOptIn}>Opt In</Button>
        </>
      )}

    </div>
  );
}

const mapStateToProps = (state: any) => ({
  addresses: addressesSelector(state),
  selectedAccount: selectedAccountSelector(state),
  optedIntoStablecoin: optedIntoStablecoinSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
