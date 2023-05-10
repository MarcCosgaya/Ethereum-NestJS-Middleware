import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { BaseWallet, HDNodeWallet, ethers } from "ethers";
import { TransactionsService } from 'src/transactions/transactions.service';
import { PrismaService } from '../prisma/prisma.service';
const solc = require('solc');
const fs = require('fs');
import { promisify } from 'util';
import { contract, transaction } from '@prisma/client';

@Injectable()
export class ContractsService {
    constructor(private readonly prisma: PrismaService, private readonly transactionsService: TransactionsService) {}

    /**
     * Call view function of a smart contract.
     * @param id Id of the smart contract
     * @returns Returned value from contract
    **/
    async get(id: number, func: string, args: string[]): Promise<string> {
        const storedContract = await this.getOne(id);
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const contract = new ethers.Contract(storedContract.address, storedContract.abi, provider);

        var returnValue = args && args.length ? await contract[func](args) : await contract[func]();
        return returnValue;
    }

    /**
     * Call update function of a smart contract.
     * @param id Id of the smart contract
     * @returns Updating transaction
    **/
    async set(id: number, func: string, args: string[], gasSettings: any, quant: number, mnemonic: string = undefined, password: string = undefined, path: string = undefined): Promise<transaction> {
        gasSettings = gasSettings ?? {};
        const {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        } = gasSettings;

        const storedContract = await this.getOne(id);
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        let signer: BaseWallet;
        try { signer = HDNodeWallet.fromPhrase(mnemonic, password, path); signer = signer.connect(provider); }
        catch { signer = new ethers.Wallet(process.env.PKEY, provider); }
        const contract = new ethers.Contract(storedContract.address, storedContract.abi, signer);

        var receipt = args && args.length ? await contract[func](...args, {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting,
            value: quant ? ethers.parseEther(quant.toString()) : undefined
        }) : await contract[func]({
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting,
            value: quant ? ethers.parseEther(quant.toString()) : undefined
        });
        return this.transactionsService.updateTransaction(receipt.hash); // Store and return the tx.
    }

    /**
     * Store smart contract in database.
     * @param tx Transaction hash in which is deployed
     * @param verified Verified status
    **/
    private async _store(abi: string, bytecode: string, source: string, address: string, tx: string, verified: boolean): Promise<contract> {
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

    /**
     * Resolve the Solidity Compiler (solc) version from a string.
     * @param version String following the "x.x.x" convention
     * @returns "vx.x.x+commit.xxxxxxx.js"-formatted version
    **/
    private _resolveVersion(version: string): string {
        const data = fs.readFileSync('solidity-versions.json', {
            encoding:'utf8',
            flag:'r'
        });
        const dataJSON = JSON.parse(data);
        const found = dataJSON.builds.find(v => v.version === version && !v.prerelease);
        return found ? 'v'+found.longVersion : 'latest'; // If version is not found, use latest.
    }

    /**
     * Check if bytecode is generated from source code.
     * @param version String following the "x.x.x" convention
    **/
    private async _verify(bytecode: string, source: string, compilerVersion: string, fileName: string): Promise<boolean> {
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

    /**
     * Deploy a new smart contract. If possible, try to verify source code
     * using ABI.
     * @param compilerVersion String following the "x.x.x" convention
    **/
    async deploy(abi: string, bytecode: string, source: string, gasSettings: any, fileName: string, compilerVersion: string, mnemonic: string = undefined, password: string = undefined, path: string = undefined): Promise<contract> {
        let verified = false;
        if (source && fileName && compilerVersion) // If possible, try to verify.
            verified = await this._verify(bytecode, source, compilerVersion, fileName);

        gasSettings = gasSettings ?? {};
        const {
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting
        } = gasSettings;

        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        let signer: BaseWallet;
        try { signer = HDNodeWallet.fromPhrase(mnemonic, password, path); signer = signer.connect(provider); }
        catch { signer = new ethers.Wallet(process.env.PKEY, provider); }
        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        const contract = await factory.deploy({
            gasLimit: gasLimitSetting,
            gasPrice: gasPriceSetting,
            maxFeePerGas: maxFeePerGasSetting,
            maxPriorityFeePerGas: maxPriorityFeePerGasSetting,
        });
        const addr = await contract.getAddress();
        const tx = contract.deploymentTransaction().hash;

        const storedContract = await this._store(abi, bytecode, source, addr, tx, verified);
        storedContract.abi = this._parseABI(storedContract);

        this.transactionsService.updateTransaction(tx);
        return storedContract;
    }

    /**
     * Parse the ABI of a smart contract.
     * @param sc Smart contract
     * @returns ABI as JS object
    **/
    private _parseABI(sc: any): any {
        return JSON.parse(sc.abi);
    }

    /**
     * Get all stored contracts.
    **/
    async getAll(pageSize: number, pageIndex: number): Promise<contract[]> {
        const contracts = await this.prisma.contract.findMany({
            skip: pageSize*pageIndex,
            take: pageSize,
        });
        contracts.forEach(contract => { contract.abi = this._parseABI(contract) });
        return contracts;
    }

    /**
     * Get one stored contract.
    **/
    async getOne(id: number): Promise<contract> {
        const contract = await this.prisma.contract.findUniqueOrThrow({ where: { id } });
        contract.abi = this._parseABI(contract);
        return contract;
    }

    /**
     * Get one stored contract using transaction.
     * @param tx Transaction hash of the contract
    **/
    private async _getOneByTx(tx: string): Promise<contract> {
        const contract = await this.prisma.contract.findUniqueOrThrow({ where: { tx } });
        contract.abi = this._parseABI(contract);
        return contract;
    }

    /**
     * Update and verify stored contract information.
    **/
    async updateContract(tx: string, abi: string, source: string, fileName: string, compilerVersion: string): Promise<contract> {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
        const addr = (await provider.getTransactionReceipt(tx))?.contractAddress;
        if (!addr) throw new ConflictException('Contract hasn\'t been deployed yet');
        const bytecode = (await provider.getTransaction(tx)).data.slice(2);

        if (!(await this._getOneByTx(tx)).verified) {
            console.log('Verifying '+addr);
            const verified = await this._verify(bytecode, source, compilerVersion, fileName);
            if (!verified) throw new BadRequestException('Source code doesn\'t match');
        }

        const contract = await this._store(abi, bytecode, source, addr, tx, true); // Always verify when updating.
        contract.abi = this._parseABI(contract);

        this.transactionsService.updateTransaction(tx);
        return contract;
    }
}
