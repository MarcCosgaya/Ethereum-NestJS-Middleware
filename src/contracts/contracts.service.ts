import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Contract, ethers } from "ethers";
import { TransactionsService } from 'src/transactions/transactions.service';
import { PrismaService } from '../prisma/prisma.service';
const solc = require('solc');
const fs = require('fs');
import { promisify } from 'util';

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

    private async _store(abi: string, bytecode: string, source: string, address: string, tx: string, verified: boolean) {
        return await this.prisma.contract.upsert({
            where: { address },
            update: {
                abi,
                bytecode,
                source,
                address,
                tx,
                verified
            },
            create: {
                abi,
                bytecode,
                source,
                address,
                tx,
                verified
            }
        });
    }

    private _resolveVersion(version: string) {
        const data = fs.readFileSync('solidity-versions.json', {
            encoding:'utf8',
            flag:'r'
        });
        const dataJSON = JSON.parse(data);
        const found = dataJSON.builds.find(v => v.version === version && !v.prerelease);
        return found ? 'v'+found.longVersion : 'latest'; // If version is not found, use latest.
    }

    private async _verify(bytecode: string, source: string, compilerVersion: string, fileName: string) {
        if (bytecode === '0x') return false;

        const sources = {};
        sources[fileName] = { content: source };
        const input = {
            language: 'Solidity',
            sources,
            settings: {
                optimizer: {
                    enabled: process.env.COMPILER_OPTIMIZE === 'true'
                },
                outputSelection: {
                    '*': {
                        '*': ['*'],
                    },
                },
            },
        };
        const resolvedVersion = this._resolveVersion(compilerVersion);

        console.log('Downloading '+resolvedVersion);
        const promisifiedLoadRemoteVersion = promisify(solc.loadRemoteVersion);
        const solc_specific = await promisifiedLoadRemoteVersion(resolvedVersion);
        console.log('Downloaded  '+resolvedVersion);

        const result = JSON.parse(solc_specific.compile(JSON.stringify(input)));
        if (result.errors && result.errors.length > 0) throw new BadRequestException(result.errors[0].message);
        const compiledBytecode = (Object.values(result.contracts[fileName])[0] as any).evm.bytecode.object;
        return compiledBytecode === bytecode;
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

        const sc = await this._store(abi, bytecode, source, addr, tx, false); // Don't verify the first time.
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

    async _getOneByTx(tx: string) {
        const contract = await this.prisma.contract.findUniqueOrThrow({ where: { tx } });
        this._parseABI(contract);
        return contract;
    }

    async updateContract(tx: string, abi: string, source: string, fileName: string, compilerVersion: string) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const addr = (await provider.getTransactionReceipt(tx))?.contractAddress;
        if (!addr) throw new ConflictException('Contract hasn\'t been deployed yet');
        const bytecode = (await provider.getTransaction(tx)).data.slice(2);

        if (!(await this._getOneByTx(tx)).verified) {
            console.log('Verifying '+addr);
            const verified = await this._verify(bytecode, source, compilerVersion, fileName);
            if (!verified) throw new BadRequestException('Source code doesn\'t match');
        }

        const sc = await this._store(abi, bytecode, source, addr, tx, true); // Always verify when updating.
        this._parseABI(sc);

        this.transactionsService.updateTransaction(tx);
        return sc;
    }
}
