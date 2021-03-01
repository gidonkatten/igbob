import React, { useState } from 'react';
import { createAsset } from '../algorand/assets/CreateAsset';
import { createStatefulContract, StateStorage } from '../algorand/contracts/CreateStatefulContract';
import { numberToUint8Array } from '../algorand/contracts/Utils';

interface IssuerPageProps {

}

function IssuerPage(props: IssuerPageProps) {

  const [bondCost, setBondCost] = useState<number>(0);
  const [bondPrincipal, setBondPrincipal] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let assetId: number = await createAsset(1, 0, "TB", "TestBond");

    const stateStorage: StateStorage = {
      localInts: 0,
      localBytes: 0,
      globalInts: 5,
      globalBytes: 1,
    }

    let start: Uint8Array = numberToUint8Array(Date.now());
    let end: Uint8Array = numberToUint8Array(Date.now() + 300);
    let assetIdFormatted: Uint8Array = numberToUint8Array(assetId);
    let bondCostFormatted: Uint8Array = numberToUint8Array(5000000); // 5 algos
    let bondPrincipalFormatted: Uint8Array = numberToUint8Array(10000000); // 10 algos
    let appArgs = [start, end, assetIdFormatted, bondCostFormatted, bondPrincipalFormatted];

    await createStatefulContract(
      "http://localhost:9000/approval_program",
      "http://localhost:9000/clear_program",
      stateStorage,
      appArgs,
    );
  }

  return (
    <div>
      Issuer
      <form onSubmit={handleSubmit}>
        <input
          value={bondCost}
          onChange={e => setBondCost(parseInt(e.target.value))}
          type="number"
          name="bondCost"
          required
        />
        <input
          value={bondPrincipal}
          onChange={e => setBondPrincipal(parseInt(e.target.value))}
          type="number"
          name="bondPrincipal"
          required
        />
        <input
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          type="date"
          name="startDate"
          required
        />
        <input
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          type="date"
          name="endDate"
          required
        />
        <button type="submit">Submit</button>
      </form>


    </div>
  );
}

export default IssuerPage;