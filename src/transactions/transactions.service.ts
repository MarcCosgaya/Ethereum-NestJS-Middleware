import { Injectable } from '@nestjs/common';
import { transaction } from '@prisma/client';
import { ethers } from 'ethers';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Store transaction in database.
     * @param from Sender address
     * @param to Recipient address
     * @param quant Quantity in Wei
    **/
    private async _store(from: string, to: string, quant: bigint, hash: string, blockHeight: number, gasUsed: bigint, gasPrice: bigint, gasLimit: bigint): Promise<transaction> {
        return await this.prisma.transaction.upsert({
            where: { hash },
            update: {
                from,
                to: to || ethers.ZeroAddress,
                quantity: quant,
                hash,
                blockHeight,
                gasUsed,
                gasPrice,
                gasLimit
            },
            create: {
                from,
                to: to || ethers.ZeroAddress,
                quantity: quant,
                hash,
                blockHeight,
                gasUsed,
                gasPrice,
                gasLimit
            }
        });
    }
    
    /**
     * Send Ethers.
     * @param to Recipient address
     * @param quant Quantity in Ethers
    **/
    async send(to: string, quant: number, gasSettings: any): Promise<transaction> {
        gasSettings = gasSettings || {};
        const {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        } = gasSettings;

        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const signer = new ethers.Wallet(process.env.PKEY, provider);

        const request = {
            to,
            value: ethers.parseEther(quant.toString()),
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        };

        const response = await signer.sendTransaction(request) // Somehow ethers still says it's a receipt :(
        const receipt = await provider.getTransactionReceipt(response.hash);

        const { from, value, hash, gasLimit } = response;
        var storedTransaction: any;
        if (receipt) {
            const { blockNumber, gasUsed, gasPrice } = receipt;
            storedTransaction = await this._store(from, to, value, hash, blockNumber, gasUsed, gasPrice, gasLimit);
            storedTransaction.confirmations = await receipt.confirmations();
        }
        else {
            storedTransaction = await this._store(from, to, value, hash, null, null, null, gasLimit);
        }

        return await this._parseTx(storedTransaction);
    }

    /**
     * Update stored transaction with block data.
    **/
    async updateTransaction(hash: string): Promise<transaction> {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));

        const response = await provider.getTransaction(hash); // Somehow ethers still says it's a receipt :(
        const receipt = await provider.getTransactionReceipt(hash);

        const { from, to, value, gasLimit } = response;
        var storedTransaction: any;
        if (receipt) {
            const { blockNumber, gasUsed, gasPrice } = receipt;
            storedTransaction = await this._store(from, to, value, hash, blockNumber, gasUsed, gasPrice, gasLimit);
            storedTransaction.confirmations = await receipt.confirmations();
        }
        else {
            storedTransaction = await this._store(from, to, value, hash, null, null, null, gasLimit);
        }

        return await this._parseTx(storedTransaction);
    }

    /**
     * Parse a transaction.
    **/
    private async _parseTx(tx: any): Promise<transaction> {
        this._parseBigInts(tx);
        tx.smartContract = await this._checkSmartContract(tx);
        tx.confirmations = await this._checkConfirmations(tx);
        return tx;
    }

    /**
     * Parse big ints into strings in a transaction.
    **/
    private _parseBigInts(tx: any): void { // Parse BigInts of a stored tx into strings because JSON.stringify still doesn't work with BigInts :(
        tx.quantity = tx.quantity.toString();
        tx.gasUsed = tx.gasUsed?.toString();
        tx.gasPrice = tx.gasPrice?.toString();
        tx.gasLimit = tx.gasLimit.toString();
    }

    /**
     * Get the amount of confirmations for transaction.
    **/
    private async _checkConfirmations(tx: transaction): Promise<number> {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const receipt = await provider.getTransactionReceipt(tx.hash);

        return await receipt?.confirmations();
    }

    /**
     * Check if transaction was done to a smart contract.
    **/
    private async _checkSmartContract(tx: transaction): Promise<boolean> {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        return (await provider.getCode(tx.to)) !== '0x';
    }

    /**
     * Get all stored transactions.
    **/
    async getAll(): Promise<transaction[]> {
        const txs = await this.prisma.transaction.findMany();
        for (const tx of txs) await this._parseTx(tx);
        return txs;
    }

    /**
     * Get one stored transaction.
    **/
    async getOne(txHash: string): Promise<transaction> {
        const tx = await this.prisma.transaction.findUniqueOrThrow({ where: { hash: txHash } });
        await this._parseTx(tx)
        return tx;
    }

    /**
     * Get the balance of an address.
     * @returns Balance in Ethers
    **/
    async getBalance(addr: string): Promise<string> {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        return ethers.formatEther(await provider.getBalance(addr));
    }

    /**
     * Sign a transaction to send Ethers.
     * @param to Recipient address
     * @param quant Quantity in Ethers
     * @returns Bytecode of signed transaction
    **/
    async sign(to: string, quant: number, gasSettings: any): Promise<string> {
        gasSettings = gasSettings || {};
        const {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        } = gasSettings;

        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const signer = new ethers.Wallet(process.env.PKEY, provider);

        const request = {
            to,
            value: ethers.parseEther(quant.toString()),
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        };

        return signer.signTransaction(await signer.populateTransaction(request))
    }

    /**
     * Broadcast an already signed transaction.
     * @param signedTx Bytecode of the signed transaction
    **/
    async sendSigned(signedTx: string): Promise<transaction> {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));

        const response = await provider.broadcastTransaction(signedTx); // Somehow ethers still says it's a receipt :(
        const receipt = await provider.getTransactionReceipt(response.hash);

        const { from, to, value, hash, gasLimit } = response;
        var storedTransaction: any;
        if (receipt) {
            const { blockNumber, gasUsed, gasPrice } = receipt;
            storedTransaction = await this._store(from, to, value, hash, blockNumber, gasUsed, gasPrice, gasLimit);
            storedTransaction.confirmations = await receipt.confirmations();
        }
        else {
            storedTransaction = await this._store(from, to, value, hash, null, null, null, gasLimit);
        }

        return await this._parseTx(storedTransaction);
    }
}
