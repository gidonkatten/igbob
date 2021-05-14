const IPFS = require('ipfs');

export class IPFSAlgoWrapper {

  private static node;

  public async init() {
    IPFSAlgoWrapper.node = await IPFS.create()
    const version = await IPFSAlgoWrapper.node.version()
    console.log('IPFS version:', version.version)
  }

  public async addData(data: File) {
    const result = await IPFSAlgoWrapper.node.add(data);
    console.log(result.cid.toString());
  }

  public async getData(cid) {
    const stream = IPFSAlgoWrapper.node.cat(cid);

    const decoder = new TextDecoder();

    let data = '';

    for await (const chunk of stream) {
      // chunks of data are returned as a UInt8Array, convert it back to a string
      data += decoder.decode(chunk)
    }

    console.log(data)
  }

}

