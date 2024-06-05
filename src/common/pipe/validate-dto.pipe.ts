import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AT_LEAST_ONE_FIELD_MUST_BE_PROVIDED } from '../constants';

@Injectable()
export class ValidateDtoPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    // console.log(errors);
    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    // Empty object validation
    if (!this.atLeastOneFieldIsPresent(value)) {
      throw new BadRequestException(AT_LEAST_ONE_FIELD_MUST_BE_PROVIDED);
    }

    return value;
  }
  private toValidate(metatype: any): boolean {
    const types: Array<any> = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private atLeastOneFieldIsPresent(object: any): boolean {
    return Object.keys(object).some((key) => {
      return object[key] !== undefined && object[key] !== null;
    });
  }

  private formatErrors(errors: any[]) {
    return errors
      .reduce((acc, err) => {
        const constraints = err.constraints;
        if (constraints) {
          Object.keys(constraints).forEach((key) => {
            const message = constraints[key];
            acc.push(`${err.property} ${message}`);
          });
        }
        return acc;
      }, [])
      .join(', ');
  }
}
