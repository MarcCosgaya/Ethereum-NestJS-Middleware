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
            response.status(409);
          else if (exception.error.message.includes('invalid RLP'))
            response.status(400);
            else if (exception.error.message.includes('underpriced'))
            response.status(402);
          else
            response.status(500);
          break;
        case 'BAD_DATA':
        case 'INVALID_ARGUMENT':
        case 'MISSING_ARGUMENT':
        case 'UNEXPECTED_ARGUMENT':
        case 'VALUE_MISMATCH': response.status(400); break;
        case 'INSUFFICIENT_FUNDS':
        case 'REPLACEMENT_UNDERPRICED': response.status(402); break;
        case 'P2025': // Not found in Prisma.
        case 'UNCONFIGURED_NAME': response.status(404); break;
        case 'UNSUPPORTED_OPERATION':
          response.status(exception.operation === 'getEnsAddress' ? 404 : 405); break;
        case 'TIMEOUT': response.status(408); break;
        case 'P2002': // Unique constraint fail in Prisma.
        case 'NONCE_EXPIRED':
        case 'TRANSACTION_REPLACED': response.status(409); break;
        case 'ACTION_REJECTED': response.status(424); break;
        case 'CALL_EXCEPTION': response.status(428); break;
        case 'P2002': response.status(409); break;
        case 'EAI_AGAIN': // Could not download Solidity compiler.
        case 'ECONNREFUSED':
        case 'NETWORK_ERROR':
        case 'SERVER_ERROR': response.status(504); break;
        default: response.status(500);
      }

      if (exception.code === 'UNKNOWN_ERROR') response.json({ message: exception.error.message });
      else response.json({ internalErrorCode: exception.code }); // debug
    }
  }
}