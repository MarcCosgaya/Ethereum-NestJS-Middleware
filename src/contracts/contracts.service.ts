import { Injectable, NotFoundException } from '@nestjs/common';
import { Contract, ethers } from "ethers";
import { TransactionsService } from 'src/transactions/transactions.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
    constructor(private prisma: PrismaService, private transactionsService: TransactionsService) {}

    async get(id: number, func: string, args: string[]) {
        const storedContract = await this.getOne(id);
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const contract = new ethers.Contract(storedContract.address, storedContract.abi, provider);

        var returnValue = args && args.length ? await contract[func](args) : await contract[func]();
        return returnValue;
    }

    async set(id: number, func: string, args: string[], gasSettings: any, q: number) {
        gasSettings = gasSettings || {};
        const {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        } = gasSettings;

        const storedContract = await this.getOne(id);
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const signer = new ethers.Wallet(process.env.PKEY, provider);
        const contract = new ethers.Contract(storedContract.address, storedContract.abi, signer);

        var receipt = args && args.length ? await contract[func](...args, {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting,
            value: q ? ethers.parseEther(q.toString()) : undefined
        }) : await contract[func]({
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting,
            value: q ? ethers.parseEther(q.toString()): undefined
        });
        return this.transactionsService.updateTransaction(receipt.hash); // Store and return the tx.
    }

    private async _store(abi: string, bytecode: string, source: string, address: string, tx: string) {
        return await this.prisma.contract.upsert({
            where: { address },
            update: {
                abi,
                bytecode,
                source,
                address,
                tx
            },
            create: {
                abi,
                bytecode,
                source,
                address,
                tx
            }
        });
    }

    async deploy(abi: string, bytecode: string, source: string, gasSettings: any) {
        gasSettings = gasSettings || {};
        const {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        } = gasSettings;

        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const signer = new ethers.Wallet(process.env.PKEY, provider);
        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        const contract = await factory.deploy({
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting,
        });
        const addr = await contract.getAddress();
        const tx = contract.deploymentTransaction().hash;

        const sc = await this._store(abi, bytecode, source, addr, tx)
        this._parseABI(sc);

        this.transactionsService.updateTransaction(tx);
        return sc;
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
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const addr = (await provider.getTransactionReceipt(tx)).contractAddress;
        const bytecode = (await provider.getTransaction(tx)).data.slice(2);

        const sc = await this._store(abi, bytecode, source, addr, tx);
        this._parseABI(sc);

        this.transactionsService.updateTransaction(tx);
        return sc;
    }
}
