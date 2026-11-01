import { IsIn, IsOptional } from "class-validator";

export class FilterTicketQueryDto {
    @IsOptional()
    @IsIn(['open', 'in_progress', 'closed'])
    status?: 'open' | 'in_progress' | 'closed';
    @IsOptional()
    @IsIn(['low', 'medium', 'high'])
    priority?: 'low' | 'medium' | 'high';
}
