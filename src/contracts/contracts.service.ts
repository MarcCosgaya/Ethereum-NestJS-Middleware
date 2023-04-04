import { Injectable, BadRequestException, InternalServerErrorException, ServiceUnavailableException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
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

        try {
            var returnValue = args && args.length ? await contract[func](args) : await contract[func]();
        }
        catch (err) {
            switch (err.code) {
                case 'UNSUPPORTED_OPERATION': throw new ForbiddenException;
                case 'ECONNREFUSED': throw new ServiceUnavailableException;
                case 'INVALID_ARGUMENT': throw new BadRequestException;
                default: throw new InternalServerErrorException;
            }
        }
        return returnValue;
    }

    async set(id: number, func: string, args: string[]) {
        const storedContract = await this.getOne(id);
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.PKEY, provider);
        const contract = new ethers.Contract(storedContract.address, storedContract.abi, signer);

        try {
            var receipt = args && args.length ? await contract[func](...args) : await contract[func]();
        }
        catch (err) {
            console.error(err)
            switch (err.code) {
                case 'UNSUPPORTED_OPERATION': throw new ForbiddenException;
                case 'ECONNREFUSED': throw new ServiceUnavailableException;
                case 'INVALID_ARGUMENT': throw new BadRequestException;
                default: throw new InternalServerErrorException;
            }
        }

        return this.transactionsService.updateTransaction(receipt.hash); // Store and return the tx.
    }

    private async _store(abi: string, bytecode: string, source: string, address: string) {
        try {
            return await this.prisma.contract.create({ data: { abi, bytecode, source, address } });
        }
        catch (err) {
            throw new ConflictException;
        }
    }

    async deploy(abi: string, bytecode: string, source: string) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.PKEY, provider);
        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        try {
            const contract = await factory.deploy();

            const addr = await contract.getAddress();

            return this._store(abi, bytecode, source, addr)
        }
        catch (err) {
            console.log(err)
            // TODO
        }
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
        const contract = await this.prisma.contract.findUniqueOrThrow({ where: { id } })
            .catch(() => { throw new NotFoundException });
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
