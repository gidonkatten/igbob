/**
 * Function used to print created asset for account and assetId
 */
export async function printCreatedAsset(algodclient: any, account: any, assetId: any) {
  // note: if you have an indexer instance available it is easier to just use this
  //     let accountInfo = await indexerClient.searchAccounts()
  //    .assetID(assetIndex).do();
  // and in the loop below use this to extract the asset for a particular account
  // accountInfo['accounts'][idx][account]);
  let accountInfo = await algodclient.accountInformation(account).do();
  for (let idx = 0; idx < accountInfo['created-assets'].length; idx++) {
    let scrutinizedAsset = accountInfo['created-assets'][idx];
    if (scrutinizedAsset['index'] === assetId) {
      console.log("AssetID = " + scrutinizedAsset['index']);
      let myparams = JSON.stringify(scrutinizedAsset['params'], undefined, 2);
      console.log("params = " + myparams);
      break;
    }
  }
}

/**
 * Function used to print asset holding for account and assetId
 */
export async function printAssetHolding(algodclient: any, account: any, assetId: any) {
  // note: if you have an indexer instance available it is easier to just use this
  //     let accountInfo = await indexerClient.searchAccounts()
  //    .assetID(assetIndex).do();
  // and in the loop below use this to extract the asset for a particular account
  // accountInfo['accounts'][idx][account]);
  let accountInfo = await algodclient.accountInformation(account).do();
  for (let idx = 0; idx < accountInfo['assets'].length; idx++) {
    let scrutinizedAsset = accountInfo['assets'][idx];
    if (scrutinizedAsset['asset-id'] === assetId) {
      let myassetholding = JSON.stringify(scrutinizedAsset, undefined, 2);
      console.log("assetholdinginfo = " + myassetholding);
      break;
    }
  }
}