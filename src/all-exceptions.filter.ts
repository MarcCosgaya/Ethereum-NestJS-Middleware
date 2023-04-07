import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp();
    const response = res.getResponse();

    console.log(exception) // debug

    if (exception instanceof HttpException) {
      response.status(exception.getStatus());
      const { message } = exception.getResponse() as any;
      response.json({ message: Array.isArray(message) ? message[0] : message })
    }
    else {
      switch (exception.code) {
        case 'UNKNOWN_ERROR':
        case 'INVALID_ARGUMENT': response.status(400); break; // Invalid arguments in Ethers.
        case 'INSUFFICIENT_FUNDS': response.status(402); break; // Not enough funds aka "payment required" in Ethers.
        case 'UNSUPPORTED_OPERATION': response.status(403); break; // Invalid funciton name in Ethers.
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