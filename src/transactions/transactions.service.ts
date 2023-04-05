import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) {}

    private async _store(from: string, to: string, quantity: bigint, hash: string, blockHeight: number, gasUsed: bigint, gasPrice: bigint, gasLimit: bigint) {
        return await this.prisma.transaction.create({ data: {
            from,
            to,
            quantity,
            hash,
            blockHeight,
            gasUsed,
            gasPrice,
            gasLimit
        }});
    }
    
    async send(to: string, q: number) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.PKEY, provider);

        const transactionResponse = await signer.sendTransaction({ to, value: ethers.parseEther(q.toString()) })
        const transactionReceipt = await provider.getTransactionReceipt(transactionResponse.hash);

        const { value, gasLimit } = transactionResponse;
        const { from, hash, blockNumber, gasUsed, gasPrice } = transactionReceipt;
        const storedTransaction = await this._store(from, to, value, hash, blockNumber, gasUsed, gasPrice, gasLimit);

        this._parseBigInts(storedTransaction);
        await this._checkSmartContract(storedTransaction);
        return storedTransaction;
    }

    async updateTransaction(hash: string) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);

        const transactionResponse = await provider.getTransaction(hash); // Somehow ethers still says it's a receipt :(
        const transactionReceipt = await provider.getTransactionReceipt(hash);

        const { value, gasLimit } = transactionResponse;
        const { from, to, blockNumber, gasUsed, gasPrice } = transactionReceipt;
        const storedTransaction = await this._store(from, to, value, hash, blockNumber, gasUsed, gasPrice, gasLimit);

        this._parseBigInts(storedTransaction);
        await this._checkSmartContract(storedTransaction);
        return storedTransaction;
    }

    private _parseBigInts(tx: any) { // Parse BigInts of a stored tx into strings because JSON.stringify still doesn't work with BigInts :(
        tx.quantity = tx.quantity.toString();
        tx.gasUsed = tx.gasUsed.toString();
        tx.gasPrice = tx.gasPrice.toString();
        tx.gasLimit = tx.gasLimit.toString();
    }

    private async _checkSmartContract(tx: any) { // Returns whether the tx is done to a smart contract address.
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        tx.smartContract = (await provider.getCode(tx.to)) !== '0x';
    }

    async getAll() {
        const txs = await this.prisma.transaction.findMany();
        txs.forEach(this._parseBigInts);
        for (const tx of txs) await this._checkSmartContract(tx);
        return txs;
    }

    async getOne(txHash: string) {
        const tx = await this.prisma.transaction.findUniqueOrThrow({ where: { hash: txHash } });
        this._parseBigInts(tx);
        await this._checkSmartContract(tx)
        return tx;
    }

    async getBalance(addr: string) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        return ethers.formatEther(await provider.getBalance(addr));
    }
}
