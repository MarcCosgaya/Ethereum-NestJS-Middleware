import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) {}

    private async _store(from: string, to: string, quantity: bigint, hash: string, blockHeight: number, gasUsed: bigint, gasPrice: bigint, gasLimit: bigint) {
        return await this.prisma.transaction.upsert({
            where: { hash },
            update: {
                from,
                to: to || ethers.ZeroAddress,
                quantity,
                hash,
                blockHeight,
                gasUsed,
                gasPrice,
                gasLimit
            },
            create: {
                from,
                to: to || ethers.ZeroAddress,
                quantity,
                hash,
                blockHeight,
                gasUsed,
                gasPrice,
                gasLimit
            }
        });
    }
    
    async send(to: string, q: number, gasSettings: any) {
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
            value: ethers.parseEther(q.toString()),
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

    async updateTransaction(hash: string) {
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

    private async _parseTx(tx: any) {
        this._parseBigInts(tx);
        await this._checkSmartContract(tx);
        await this._checkConfirmations(tx);
        return tx;
    }

    private _parseBigInts(tx: any) { // Parse BigInts of a stored tx into strings because JSON.stringify still doesn't work with BigInts :(
        tx.quantity = tx.quantity.toString();
        tx.gasUsed = tx.gasUsed?.toString();
        tx.gasPrice = tx.gasPrice?.toString();
        tx.gasLimit = tx.gasLimit.toString();
    }

    private async _checkConfirmations(tx: any) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const receipt = await provider.getTransactionReceipt(tx.hash);

        tx.confirmations = await receipt?.confirmations();
    }

    private async _checkSmartContract(tx: any) { // Returns whether the tx is done to a smart contract address.
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        tx.smartContract = (await provider.getCode(tx.to)) !== '0x';
    }

    async getAll() {
        const txs = await this.prisma.transaction.findMany();
        for (const tx of txs) await this._parseTx(tx);
        return txs;
    }

    async getOne(txHash: string) {
        const tx = await this.prisma.transaction.findUniqueOrThrow({ where: { hash: txHash } });
        await this._parseTx(tx)
        return tx;
    }

    async getBalance(addr: string) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        return ethers.formatEther(await provider.getBalance(addr));
    }

    async sign(to: string, q: number, gasSettings: any) {
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
            value: ethers.parseEther(q.toString()),
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        };

        return signer.signTransaction(await signer.populateTransaction(request))
    }

    async sendSigned(signedTx: string) {
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
