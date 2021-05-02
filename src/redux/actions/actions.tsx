export const setAccountAddresses = (addresses: string[]) => ({
  type: "SET_ACCOUNT_ADDRESSES",
  payload: { addresses }
});

export const setSelectedAddress = (address: string) => ({
  type: "SET_SELECTED_ADDRESS",
  payload: { address }
});
