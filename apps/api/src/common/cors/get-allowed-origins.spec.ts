import { getAllowedOrigins } from './get-allowed-origins';

describe('getAllowedOrigins', () => {
  it('allows only the local dev origin when FRONTEND_URL is unset', () => {
    expect(getAllowedOrigins(undefined)).toEqual(['http://localhost:3000']);
    expect(getAllowedOrigins('')).toEqual(['http://localhost:3000']);
  });

  it('strips trailing slashes so the browser Origin header matches', () => {
    expect(getAllowedOrigins('https://ipon.vercel.app/')).toEqual([
      'http://localhost:3000',
      'https://ipon.vercel.app',
    ]);
  });

  it('accepts a comma-separated list and ignores blanks and duplicates', () => {
    expect(
      getAllowedOrigins(
        ' https://ipon.vercel.app , https://www.ipon.app//,,http://localhost:3000',
      ),
    ).toEqual([
      'http://localhost:3000',
      'https://ipon.vercel.app',
      'https://www.ipon.app',
    ]);
  });
});
