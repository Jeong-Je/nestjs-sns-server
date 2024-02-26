import {
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

export const QueryRunner = createParamDecorator(
  (data, context: ExecutionContextHost) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
      throw new InternalServerErrorException(
        `QueryRunner Decorator를 사용하려면 TransactionInterceptor를 적용해야 합니다.`,
      );
    }

    return req.queryRunner;
  },
);
