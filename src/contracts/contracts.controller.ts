import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UpdateDto } from './dtos/update.dto';

@Controller('contracts')
export class ContractsController {
    @Get(':id/call/:func')
    view(@Param('id') id: string, @Param('func') func: string) {
        return id+func;
    }

    @Post(':id/call/:func')
    update(@Param('id') id: string, @Param('func') func: string, @Body() body: UpdateDto) {
        return id;
    }
}
