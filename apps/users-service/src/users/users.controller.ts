import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  USER_PATTERNS,
  CreateUserPayload,
  UpdateUserPayload,
  FindUserByEmailPayload,
  FindUserByIdPayload,
} from '@autonova/types';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USER_PATTERNS.CREATE)
  create(@Payload() payload: CreateUserPayload) {
    return this.usersService.create(payload);
  }

  @MessagePattern(USER_PATTERNS.FIND_BY_ID)
  findById(@Payload() payload: FindUserByIdPayload) {
    return this.usersService.findById(payload.id, payload.tenantId);
  }

  @MessagePattern(USER_PATTERNS.FIND_BY_EMAIL)
  findByEmail(@Payload() payload: FindUserByEmailPayload) {
    return this.usersService.findByEmail(payload.email, payload.tenantId);
  }

  @MessagePattern(USER_PATTERNS.FIND_ALL)
  findAll(@Payload() payload: { tenantId: string; page?: number; limit?: number }) {
    return this.usersService.findAll(payload.tenantId, payload.page, payload.limit);
  }

  @MessagePattern(USER_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateUserPayload) {
    return this.usersService.update(payload);
  }

  @MessagePattern(USER_PATTERNS.DELETE)
  remove(@Payload() payload: FindUserByIdPayload) {
    return this.usersService.remove(payload.id, payload.tenantId);
  }

  @MessagePattern(USER_PATTERNS.CHANGE_PASSWORD)
  changePassword(@Payload() payload: { id: string; tenantId: string; currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(payload);
  }
}
