import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class UuidHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user_id_header = request.headers['x-user-id'];

    if (!user_id_header || !isUUID(user_id_header)) {
      throw new BadRequestException('Invalid or missing x-user-id header');
    }

    return true;
  }
}
