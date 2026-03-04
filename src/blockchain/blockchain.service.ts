import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import axios from 'axios';

export interface TokenInfo {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  decimals: number;
}

export interface TxInfo {
  hash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  blockNumber: number;
  timestamp: Date;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('polygon.rpcUrl');
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getNativeBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getERC20Balances(address: string): Promise<TokenInfo[]> {
    const covalentApiKey = this.configService.get<string>('polygon.covalentApiKey');
    if (!covalentApiKey) {
      this.logger.warn('COVALENT_API_KEY not set, skipping ERC20 balances');
      return [];
    }
    try {
      const url = `https://api.covalenthq.com/v1/137/address/${address}/balances_v2/?key=${covalentApiKey}`;
      const response = await axios.get(url);
      const items = response.data?.data?.items || [];
      return items
        .filter((item: any) => item.contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
        .map((item: any) => ({
          tokenAddress: item.contract_address,
          tokenSymbol: item.contract_ticker_symbol || '',
          tokenName: item.contract_name || '',
          balance: item.balance || '0',
          decimals: item.contract_decimals || 18,
        }));
    } catch (err) {
      this.logger.error('Failed to fetch ERC20 balances', err);
      return [];
    }
  }

  async getTransactions(address: string, fromBlock?: number): Promise<TxInfo[]> {
    const polygonscanApiKey = this.configService.get<string>('polygon.polygonscanApiKey');
    if (!polygonscanApiKey) {
      this.logger.warn('POLYGONSCAN_API_KEY not set, skipping transactions');
      return [];
    }
    try {
      const startBlock = fromBlock || 0;
      const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&sort=asc&apikey=${polygonscanApiKey}`;
      const response = await axios.get(url);
      const txs = response.data?.result || [];
      if (!Array.isArray(txs)) return [];
      return txs.map((tx: any) => ({
        hash: tx.hash,
        fromAddress: tx.from,
        toAddress: tx.to,
        value: tx.value,
        blockNumber: parseInt(tx.blockNumber, 10),
        timestamp: new Date(parseInt(tx.timeStamp, 10) * 1000),
      }));
    } catch (err) {
      this.logger.error('Failed to fetch transactions', err);
      return [];
    }
  }
}
