import { Controller, Get, Param, ParseIntPipe, Post, Query, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';

import { FilterTicketQueryDto } from './dto/filter-ticket-query.dto.js';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketService: TicketsService) {}
    @Get()
    findAll(@Query() filters: FilterTicketQueryDto) {
        return this.ticketService.findAll(filters.status, filters.priority);
    }

  

    @Get(':id')
    findOne(@Param('id', ParseIntPipe ) id: number) {
        return this.ticketService.findone(id);
    }


    @Post()
    create(@Body() createTicketDto: CreateTicketDto) {  
        return this.ticketService.create(createTicketDto);
    }
}

