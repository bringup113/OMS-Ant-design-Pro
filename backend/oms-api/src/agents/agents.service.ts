import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    const agent = this.agentRepository.create(createAgentDto);
    return this.agentRepository.save(agent);
  }

  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Agent> {
    const agent = await this.agentRepository.findOneBy({ id });
    if (!agent) {
      throw new NotFoundException(`代理ID ${id} 不存在`);
    }
    return agent;
  }

  async update(id: number, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.findOne(id);
    await this.agentRepository.update(id, updateAgentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const agent = await this.findOne(id);
    await this.agentRepository.delete(id);
  }
} 