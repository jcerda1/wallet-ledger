import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { isUUID } from 'class-validator';

@Injectable()
export class UuidHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.headers['x-user-id'];

    if (!userId || Array.isArray(userId) || !isUUID(userId)) {
      throw new BadRequestException('Invalid or missing x-user-id header');
    }

    return true;
  }
}
