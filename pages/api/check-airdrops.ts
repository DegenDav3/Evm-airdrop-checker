import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const COVALENT_API_KEY = process.env.COVALENT_API_KEY;
const CHAINS = [1, 137, 42161, 10, 8453];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Invalid address' });
  }

  try {
    const allResults: any[] = [];

    for (const chainId of CHAINS) {
      const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/transfers_v2/?key=${COVALENT_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data?.data?.items) {
        const airdropLike = data.data.items.filter((tx: any) => {
          return (
            tx.from_address?.toLowerCase() !== address.toLowerCase() &&
            tx.delta > 0 &&
            tx.transfer_type === 'transfer' &&
            tx.log_events?.some((log: any) => log.decoded?.name?.toLowerCase().includes('claim'))
          );
        });
        allResults.push(...airdropLike);
      }
    }

    const totalClaimed = allResults.reduce((acc, tx) => acc + Number(tx.delta), 0);

    return res.status(200).json({
      address,
      totalAirdrops: allResults.length,
      totalClaimed,
      tokens: allResults.map(tx => ({
        token: tx.contract_ticker_symbol,
        amount: tx.delta / Math.pow(10, tx.contract_decimals),
        tx_hash: tx.tx_hash,
        chain_id: tx.chain_id,
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}