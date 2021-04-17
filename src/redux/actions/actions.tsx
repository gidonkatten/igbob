export const setId = (id: number) => ({
  type: "SET_ID",
  payload: { id }
});

export const setAccountAddresses = (addresses: string[]) => ({
  type: "SET_ACCOUNT_ADDRESSES",
  payload: { addresses }
});
