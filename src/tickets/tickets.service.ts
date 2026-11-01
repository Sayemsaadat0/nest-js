import { Injectable, NotFoundException } from '@nestjs/common';
import { Ticket } from './ticket.interface.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
@Injectable()
export class TicketsService {
  private readonly tickets: Ticket[] = [
    {
      id: 1,
      title: 'Ticket 1',
      subject: 'Subject 1',
      description: 'Description 1',
      priority: 'high',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Ticket 2',
      subject: 'Subject 2',
      description: 'Description 2',
      priority: 'medium',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Ticket 3',
      subject: 'Subject 3',
      description: 'Description 3',
      priority: 'low',
      status: 'closed',
      createdAt: new Date().toISOString(),
    },
  ];
   
  private nextId = 4; // Next ID to assign for new tickets





  // goal is to apply the query params 

  findAll(status?: Ticket['status'], priority?: Ticket['priority']) {
    let result = this.tickets;
    if(status){
        result = result.filter((ticket) => ticket.status === status);
    }
    if(priority){
        result = result.filter((ticket) => ticket.priority === priority);
    }
    return result;
  }


  findone(id: number) {
    const ticket = this.tickets.find((ticket) => ticket.id === id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }
    return ticket;
  }


  create(createTicketDto : CreateTicketDto){
    const ticket : Ticket ={
        id: this.nextId++,
        title: createTicketDto.title,
        subject: createTicketDto.subject,
        description: createTicketDto.description,
        priority: createTicketDto.priority,
        status: createTicketDto.status,
        createdAt: new Date().toISOString(),
    }
    this.tickets.push(ticket);
    
    return ticket;
  }


}
