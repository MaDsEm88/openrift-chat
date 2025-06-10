import * as z from "zod";

const envSchema = z.object({
  APPLE_APP_BUNDLE_IDENTIFIER: z.string().min(1).optional(),
  APPLE_CLIENT_ID: z.string().min(1).optional(),
  APPLE_CLIENT_SECRET: z.string().min(1).optional(),
  AUTUMN_SECRET_KEY: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_WEB_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_IOS_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_ANDROID_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_REDIRECT_URI: z.string().min(1),
  INSTAGRAM_CLIENT_ID: z.string().min(1).optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().min(1).optional(),
  INSTAGRAM_IOS_CLIENT_ID: z.string().min(1).optional(),
  INSTAGRAM_ANDROID_CLIENT_ID: z.string().min(1).optional(),
  FACEBOOK_CLIENT_ID: z.string().min(1).optional(),
  FACEBOOK_CLIENT_SECRET: z.string().min(1).optional(),
  FACEBOOK_IOS_CLIENT_ID: z.string().min(1).optional(),
  FACEBOOK_ANDROID_CLIENT_ID: z.string().min(1).optional(),
  FACEBOOK_IOS_CLIENT_SECRET: z.string().min(1).optional(),
  FACEBOOK_ANDROID_CLIENT_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().min(1).optional(),
  VITE_APP_URL: z.string().min(1),
  SITE_NAME: z.string().min(1).optional(),
  // Add the missing environment variable
  BLOCK_WEB_USER_CREATION: z.string().optional().transform(val => val === 'true'),
});

export const env = envSchema.parse(process.env);