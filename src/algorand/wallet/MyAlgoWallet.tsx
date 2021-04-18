import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';
import store from '../../redux/store';
import { setAccountAddresses } from '../../redux/actions/actions';

export const myAlgoWallet = new MyAlgo();

/*Warning: Browser will block pop-up if user doesn't trigger myAlgoWallet.connect() with a button interation */
export const connectToMyAlgo = async () => {
  try {
    const accounts: Accounts[] = await myAlgoWallet.connect();

    const addresses = accounts.map(account => account.address);
    console.log(addresses);

    store.dispatch(setAccountAddresses(addresses));
  } catch (err) {
    console.error(err);
  }
}