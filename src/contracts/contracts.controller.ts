import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
    constructor(private contractsService: ContractsService) {}

    @Get(':id/call/:func')
    view(@Param('id') id: string, @Param('func') func: string, @Query() params: any) {
        const { args } = params;
        return this.contractsService.get(func, args);
    }

    @Post(':id/call/:func')
    update(@Param('id') id: string, @Param('func') func: string, @Query() params: any) {
        const { args } = params;
        return this.contractsService.set(func, args);
    }
}
