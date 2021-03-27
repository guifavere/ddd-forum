import { UserEmail } from './userEmail';
import { UserName } from './useName';
import { UserId } from './userid';
import { UserPassword } from './userPassword';
import { JWTToken, RefreshToken } from './jwt';
import { UserCreated } from './events/userCreated';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { AggregateRoot } from '../../../shared/domain/AggregateRoot';

interface UserProps {
  email: UserEmail;
  username: UserName;
  password: UserPassword;
  isEmailVerified?: boolean;
  isAdminUser?: boolean;
  accessToken?: JWTToken;
  refreshToken?: RefreshToken;
  isDeleted?: boolean;
  lastLogin?: Date;
}

export class User extends AggregateRoot<UserProps> {

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.username, argumentName: 'username' },
      { argument: props.email, argumentName: 'email' }
    ]);

    if (!guardResult.succeeded) {
      return Result.fail<User>(guardResult.message);
    }

    const isNewUser = !!id === false;

    const user = new User({
      ...props,
      isDeleted: props.isDeleted ? props.isDeleted : false,
      isEmailVerified: props.isEmailVerified ? props.isEmailVerified : false,
      isAdminUser: props.isAdminUser ? props.isAdminUser : false,
    }, id);

    if (isNewUser) {
      user.addDomainEvent(new UserCreated(user));
    }

    return Result.ok<User>(user);
  }

  get userId(): UserId {
    return UserId.create(this._id).getValue();
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get username(): UserName {
    return this.props.username;
  }

  get password(): UserPassword {
    return this.props.password;
  }
}
