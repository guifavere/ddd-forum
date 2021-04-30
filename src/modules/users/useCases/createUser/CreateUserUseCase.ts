import { CreateUserDTO } from './CreateUserDTO';
import { CreateUserErrors } from './CreateUserErrors';
import { Either, Result, left, right } from '../../../../shared/core/Result';
import { AppError } from '../../../../shared/core/AppError';
import { IUserRepo } from '../../repos/userRepo';
import { UseCase } from '../../../../shared/core/UseCase';
import { UserEmail } from '../../domain/userEmail';
import { UserPassword } from '../../domain/userPassword';
import { UserName } from '../../domain/userName';
import { User } from '../../domain/user';

type Response = Either<
  CreateUserErrors.EmailAlreadyExistsError |
  CreateUserErrors.UsernameTakenError |
  AppError.UnexpectedError |
  Result<any>,
  Result<void>
>

export class CreateUserUseCase implements UseCase<CreateUserDTO, Promise<Response>> {
  private userRepo: IUserRepo;

  constructor(userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  async execute(request: CreateUserDTO): Promise<Response> {
    const emailOrError = UserEmail.create(request.email);
    const passwordOrError = UserPassword.create({ value: request.password });
    const usernameOrError = UserName.create({ name: request.username });

    const dtoResult = Result.combine([emailOrError, passwordOrError, usernameOrError]);

    if (dtoResult.isFailure) {
      return left(Result.fail<void>(dtoResult.error));
    }

    const email = emailOrError.getValue();
    const password = passwordOrError.getValue();
    const username = usernameOrError.getValue();

    try {
      const userAlreadyExists = await this.userRepo.exists(email);

      if (userAlreadyExists) {
        return left(new CreateUserErrors.EmailAlreadyExistsError(email.value));
      }

      try {
        const alreadyCreatedUserByUserName = await this.userRepo.getUserByUserName(username);

        const userNameTaken = !!alreadyCreatedUserByUserName === true;

        if (userNameTaken) {
          return left(new CreateUserErrors.UsernameTakenError(username.value));
        }
      } catch (error) {}

      const userOrError = User.create({ email, password, username });

      if (userOrError.isFailure) {
        return left(Result.fail<User>(userOrError.error.toString()));
      }

      const user = userOrError.getValue();

      await this.userRepo.save(user);

      return right(Result.ok<void>());
    } catch (error) {
      return left(new AppError.UnexpectedError(error));
    }
  }
}
