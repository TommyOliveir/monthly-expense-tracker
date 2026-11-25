import { loadJwtSecrets } from './jwt-secrets';

describe('loadJwtSecrets', () => {
  it('returns both secrets when they are set', () => {
    expect(
      loadJwtSecrets({ JWT_SECRET: 'access', JWT_REFRESH_SECRET: 'refresh' }),
    ).toEqual({ accessSecret: 'access', refreshSecret: 'refresh' });
  });

  it('refuses to start without the access secret', () => {
    expect(() => loadJwtSecrets({ JWT_REFRESH_SECRET: 'refresh' })).toThrow(
      'Missing JWT_SECRET.',
    );
  });

  it('names every missing secret, treating blank values as missing', () => {
    expect(() =>
      loadJwtSecrets({ JWT_SECRET: '   ', JWT_REFRESH_SECRET: '' }),
    ).toThrow('Missing JWT_SECRET and JWT_REFRESH_SECRET.');
  });

  it('refuses to start when both secrets are the same', () => {
    expect(() =>
      loadJwtSecrets({ JWT_SECRET: 'same', JWT_REFRESH_SECRET: 'same' }),
    ).toThrow('must be different');
  });
});
