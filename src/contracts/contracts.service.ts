import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ethers } from "ethers";

@Injectable()
export class ContractsService {
    async get(func: string, args: string[]) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDR, process.env.ABI, provider);

        try {
            var returnValue = args && args.length ? await contract[func](args) : await contract[func]();
        }
        catch (err) {
            if (err.code === 'UNSUPPORTED_OPERATION') throw new BadRequestException;
            else throw new InternalServerErrorException;
        }
        return returnValue;
    }

    async set(func: string, args: string[]) {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER);
        const signer = new ethers.Wallet(process.env.PKEY, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDR, process.env.ABI, signer);
        
        try {
            var returnValue = args && args.length ? await contract[func](args) : await contract[func]();
        }
        catch (err) {
            if (err.code === 'UNSUPPORTED_OPERATION') throw new BadRequestException;
            else throw new InternalServerErrorException;
        }

        return returnValue;
    }
}
