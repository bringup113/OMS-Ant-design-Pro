declare namespace API {
  type Agent = {
    id: number;
    name: string;
    contact: string;
    status: string;
    cooperationType: string;
    commissionRate: number | null;
    createdAt: string;
    updatedAt: string;
  };

  type CreateAgentParams = {
    name: string;
    contact: string;
    status?: string;
    cooperationType: string;
    commissionRate?: number;
  };

  type UpdateAgentParams = Partial<CreateAgentParams>;
} 