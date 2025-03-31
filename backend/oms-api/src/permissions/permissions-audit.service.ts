import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionAuditLog } from './entities/permission-audit-log.entity';
import { Request } from 'express';

@Injectable()
export class PermissionsAuditService {
  constructor(
    @InjectRepository(PermissionAuditLog)
    private auditLogRepository: Repository<PermissionAuditLog>,
  ) {}

  /**
   * 记录权限变更审计日志
   * @param req 请求对象
   * @param action 操作类型 ('GRANT' | 'REVOKE' | 'MODIFY')
   * @param details 操作详情
   * @param params 相关参数 (userId, roleId, permissionId, oldValue, newValue)
   */
  async logPermissionChange(
    req: Request,
    action: string,
    details: string,
    params: {
      userId?: number;
      roleId?: number;
      permissionId?: number;
      oldValue?: any;
      newValue?: any;
    },
  ): Promise<PermissionAuditLog> {
    const ipAddress = this.getClientIp(req);
    const user = req.user as any;

    // 手动创建审计日志对象
    const logEntry = new PermissionAuditLog();
    logEntry.user_id = user?.id || null;
    logEntry.role_id = params.roleId || null;
    logEntry.permission_id = params.permissionId || null;
    logEntry.action = action;
    logEntry.details = details;
    logEntry.old_value = params.oldValue ? JSON.stringify(params.oldValue) : null;
    logEntry.new_value = params.newValue ? JSON.stringify(params.newValue) : null;
    logEntry.ip_address = ipAddress;

    // 保存到数据库
    return this.auditLogRepository.save(logEntry as PermissionAuditLog);
  }

  /**
   * 获取请求客户端IP地址
   * @param req 请求对象
   * @returns IP地址
   */
  private getClientIp(req: Request): string {
    // X-Forwarded-For: <client>, <proxy1>, <proxy2>
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      return ips[0] || req.socket.remoteAddress || '';
    }
    return req.socket.remoteAddress || '';
  }

  /**
   * 获取权限审计日志列表
   * @param page 页码
   * @param limit 每页条数
   * @returns 审计日志列表和总数
   */
  async getAuditLogs(page: number = 1, limit: number = 10) {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      relations: ['user', 'role', 'permission'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { logs, total };
  }
} 