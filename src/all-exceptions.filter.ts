import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp();
    const response = res.getResponse();

    console.log(exception) // debug

    if (exception instanceof HttpException) { // Resend if already an HTTP exception.
      response.status(exception.getStatus());
      const { message } = exception.getResponse() as any;
      response.json({ message: Array.isArray(message) ? message[0] : message })
    }
    else {
      switch (exception.code) {
        case 'UNKNOWN_ERROR':
          if (exception.error.message.includes('correct nonce'))
            response.status(412);
          break;
        case 'INVALID_ARGUMENT':
        case 'MISSING_ARGUMENT':
        case 'UNEXPECTED_ARGUMENT':
        case 'VALUE_MISMATCH': response.status(400); break;
        case 'INSUFFICIENT_FUNDS':
        case 'REPLACEMENT_UNDERPRICED': response.status(402); break;
        case 'UNCONFIGURED_NAME': response.status(404); break;
        case 'TIMEOUT': response.status(408); break;
        case 'NONCE_EXPIRED':
        case 'TRANSACTION_REPLACED': response.status(409); break;
        case 'CALL_EXCEPTION': response.status(412); break;
        case 'ACTION_REJECTED': response.status(424); break;
        case 'P2025': response.status(404); break; // Not found in Prisma.
        case 'P2002': response.status(409); break; // Unique constraint fail in Prisma.
        case 'ECONNREFUSED': response.status(503); break; // No access to BC in Ethers.
        default: response.status(500);
      }

      if (exception.code === 'UNKNOWN_ERROR') response.json({ message: exception.error.message });
      else response.json({ internalErrorCode: exception.code }); // debug
    }
  }
}