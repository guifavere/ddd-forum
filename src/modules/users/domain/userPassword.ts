import * as bcrypt from 'bcrypt-nodejs';
import { ValueObject } from '../../../shared/domain/ValueObject';
import { Guard } from '../../../shared/core/Guard';
import { Result } from '../../../shared/core/Result';

export interface IUserPasswordProps {
  value: string;
  hashed?: boolean;
}

export class UserPassword extends ValueObject<IUserPasswordProps> {
  public static minLength: number = 6;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: IUserPasswordProps) {
    super(props);
  }

  private static isAppropriateLength(password: string): boolean {
    return password.length >= this.minLength;
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    let hashed: string;

    if (this.isAlreadyHashed()) {
      hashed = this.props.value;

      return this.bcryptCompare(plainTextPassword, hashed);
    }

    return this.props.value === plainTextPassword;
  }

  private bcryptCompare(plainText: string, hashed: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainText, hashed, (error, compareResult) => {
        if (error) {
          return resolve(false);
        }

        return resolve(compareResult);
      })
    })
  }

  public isAlreadyHashed(): boolean {
    return this.props.hashed;
  }

  private hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, null, null, (error, hash) => {
        if (error) {
          return reject(error);
        }

        resolve(hash);
      })
    })
  }

  public getHashedValue(): Promise<string> {
    return new Promise((resolve) => {
      if (this.isAlreadyHashed()) {
        return resolve(this.props.value);
      }

      return resolve(this.hashPassword(this.props.value));
    })
  }

  public static create(props: IUserPasswordProps): Result<UserPassword> {
    const propsResult = Guard.againstNullOrUndefined(props.value, 'password');

    if (!propsResult.succeeded) {
      return Result.fail<UserPassword>(propsResult.message);
    }

    if (!props.hashed && !this.isAppropriateLength(props.value)) {
      return Result.fail<UserPassword>('Password doesnt meet criteria [8 chars min].');
    }

    return Result.ok<UserPassword>(new UserPassword({
      value: props.value,
      hashed: !!props.hashed === true
    }));
  }
}