// src/auth/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

// We create a unique key for our metadata. This prevents naming collisions.
export const IS_PUBLIC_KEY = 'isPublic';

// This is our actual decorator. When you use @Public(), it will apply
// the metadata IS_PUBLIC_KEY with a value of true to the route handler.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);