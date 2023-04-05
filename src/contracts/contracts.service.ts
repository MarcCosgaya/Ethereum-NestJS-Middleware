import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from "ethers";
import { TransactionsService } from 'src/transactions/transactions.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
    constructor(private prisma: PrismaService, private transactionsService: TransactionsService) {}

    async get(id: number, func: string, args: string[]) {
        const storedContract = await this.getOne(id);
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const contract = new ethers.Contract(storedContract.address, storedContract.abi, provider);

        var returnValue = args && args.length ? await contract[func](args) : await contract[func]();
        return returnValue;
    }

    async set(id: number, func: string, args: string[]) {
        const storedContract = await this.getOne(id);
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.PKEY, provider);
        const contract = new ethers.Contract(storedContract.address, storedContract.abi, signer);

        var receipt = args && args.length ? await contract[func](...args) : await contract[func]();
        return this.transactionsService.updateTransaction(receipt.hash); // Store and return the tx.
    }

    private async _store(abi: string, bytecode: string, source: string, address: string) {
        return await this.prisma.contract.create({ data: { abi, bytecode, source, address } });
    }

    async deploy(abi: string, bytecode: string, source: string) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.PKEY, provider);
        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        const contract = await factory.deploy();
        const addr = await contract.getAddress();

        return this._store(abi, bytecode, source, addr)
    }

    private _parseABI(sc: any) {
        sc.abi = JSON.parse(sc.abi);
    }

    async getAll() {
        const contracts = await this.prisma.contract.findMany();
        contracts.forEach(this._parseABI);
        return contracts;
    }

    async getOne(id: number) {
        const contract = await this.prisma.contract.findUniqueOrThrow({ where: { id } });
        this._parseABI(contract);
        return contract;
    }

    async updateContract(tx: string, abi: string, source: string) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const addr = (await provider.getTransactionReceipt(tx)).contractAddress;
        const bytecode = (await provider.getTransaction(tx)).data.slice(2);
        return this._store(abi, bytecode, source, addr);
    }
}
