import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '@/auth/dto/login.dto';
import { CreateUserDto } from '@/user/dto/create-user-dto';
import { normalizeEmail } from './normalize-email';

describe('normalizeEmail', () => {
  it.each([
    ['Tommy@Mail.com', 'tommy@mail.com'],
    ['  tommy@mail.com ', 'tommy@mail.com'],
    ['tommy@mail.com', 'tommy@mail.com'],
  ])('normalizes %p to %p', (input, expected) => {
    expect(normalizeEmail(input)).toBe(expected);
  });

  it('leaves non-string values for the validators to reject', () => {
    expect(normalizeEmail(42)).toBe(42);
    expect(normalizeEmail(undefined)).toBeUndefined();
  });

  it('normalizes the login email before validation', async () => {
    const dto = plainToInstance(LoginDto, {
      email: ' Tommy@Mail.com ',
      password: 'secret',
    });

    expect(dto.email).toBe('tommy@mail.com');
    expect(await validate(dto)).toHaveLength(0);
  });

  it('normalizes the signup email and still rejects an invalid one', async () => {
    const valid = plainToInstance(CreateUserDto, {
      name: 'Tommy',
      email: 'TOMMY@MAIL.COM',
      password: 'password123',
    });
    const invalid = plainToInstance(CreateUserDto, {
      name: 'Tommy',
      email: 'not-an-email',
      password: 'password123',
    });

    expect(valid.email).toBe('tommy@mail.com');
    expect(await validate(valid)).toHaveLength(0);
    expect((await validate(invalid)).map((error) => error.property)).toEqual([
      'email',
    ]);
  });
});
