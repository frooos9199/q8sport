/**
 * Environment Variables Validation
 * يتحقق من وجود جميع المتغيرات البيئية المطلوبة عند بدء التطبيق
 */

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  NEXT_PUBLIC_APP_URL: string;
}

/**
 * Required environment variables
 */
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_APP_URL'
] as const;

/**
 * Optional environment variables with defaults
 */
const optionalEnvVars = {
  NODE_ENV: 'development',
  RESEND_API_KEY: '',
  CLOUDINARY_CLOUD_NAME: '',
  CLOUDINARY_API_KEY: '',
  CLOUDINARY_API_SECRET: '',
  EMAIL_FROM: 'Q8Sport <noreply@q8sportcar.com>',
} as const;

/**
 * Validate all required environment variables
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease check your .env file.`
    );
  }
  
  // Validate JWT_SECRET is not a default value
  if (process.env.JWT_SECRET === 'your-secret-key' || process.env.JWT_SECRET === 'your-jwt-secret-key-here') {
    throw new Error(
      'JWT_SECRET is set to a default/insecure value. Please generate a secure secret:\n' +
      '  openssl rand -base64 32'
    );
  }
  
  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET is less than 32 characters. Consider using a longer secret for better security.');
  }
  
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  };
}

/**
 * Get environment variable with default value
 */
export function getEnvVar(key: keyof typeof optionalEnvVars, defaultValue?: string): string {
  return process.env[key] || defaultValue || optionalEnvVars[key];
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get app URL
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Validate env on module load (only in Node.js environment)
 */
if (typeof window === 'undefined') {
  try {
    validateEnv();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    
    if (isProduction()) {
      process.exit(1);
    }
  }
}
