import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthenticatedRequest, IAuthenticatedUser } from '@/auth/types/user';

// export const GetUser = createParamDecorator(
//   (data: string | undefined, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     const user = request.user;

//     // If a property key is passed (e.g., @GetUser('id')), return just that field
//     return data ? user?.[data] : user;
//   },
// );

export const GetUser = createParamDecorator<
  keyof IAuthenticatedUser | undefined
>((data: keyof IAuthenticatedUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<IAuthenticatedRequest>();
  const user = request.user;

  return data ? user?.[data] : user;
});
