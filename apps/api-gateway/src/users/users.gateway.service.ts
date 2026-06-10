import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SERVICES, USER_PATTERNS } from '@autonova/types';
import { BaseGatewayService } from '../common/services/base-gateway.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersGatewayService extends BaseGatewayService {
  constructor(@Inject(SERVICES.USERS) private readonly client: ClientProxy) {
    super();
  }

  findAll(query: UserQueryDto, tenantId: string) {
    return this.send(this.client, USER_PATTERNS.FIND_ALL, { ...query, tenantId });
  }

  findOne(id: string, tenantId: string) {
    return this.send(this.client, USER_PATTERNS.FIND_BY_ID, { id, tenantId });
  }

  update(id: string, dto: UpdateUserDto, tenantId: string) {
    return this.send(this.client, USER_PATTERNS.UPDATE, { ...dto, id, tenantId });
  }

  remove(id: string, tenantId: string) {
    return this.send(this.client, USER_PATTERNS.DELETE, { id, tenantId });
  }

  changePassword(userId: string, dto: ChangePasswordDto, tenantId: string) {
    return this.send(this.client, USER_PATTERNS.CHANGE_PASSWORD, { ...dto, id: userId, tenantId });
  }
}
