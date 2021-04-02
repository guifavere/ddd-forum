import { Result } from './Result';
import { UseCaseError } from './UseCaseError';

export namespace AppError {
  export class UnexpectedError extends Result<UseCaseError> {
    public constructor(error: any) {
      super(false, {
        message: `An unexpected error occurred.`,
        error,
      } as UseCaseError);

      console.log(`[AppError]: An unexpected error occurred`);
      console.log(error);
    }

    public static create(error: any): UnexpectedError {
      return new UnexpectedError(error);
    }
  }
}
