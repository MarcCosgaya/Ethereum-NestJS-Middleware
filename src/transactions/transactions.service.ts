import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) {}

    async _store(from: string, to: string, quantity: bigint, hash: string, blockHeight: number, gasUsed: bigint, gasPrice: bigint, gasLimit: bigint) {
        try {
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
        catch (err) {
            throw new ConflictException;
        }
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
        return storedTransaction;
    }

    _parseBigInts(tx: any) { // Parse BigInts of a stored tx into strings because JSON.stringify still doesn't work with BigInts :(
        tx.quantity = tx.quantity.toString();
        tx.gasUsed = tx.gasUsed.toString();
        tx.gasPrice = tx.gasPrice.toString();
        tx.gasLimit = tx.gasLimit.toString();
    }

    async getAll() {
        const transactions = await this.prisma.transaction.findMany();
        transactions.forEach(this._parseBigInts);
        return transactions;
    }

    async getOne(txHash: string) {
        const transaction = await this.prisma.transaction.findUniqueOrThrow({ where: { hash: txHash } })
            .catch(() => { throw new NotFoundException });
        this._parseBigInts(transaction);
        return transaction;
    }
}
