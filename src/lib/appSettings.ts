import { prisma } from './prisma';

export type AppSettings = {
  autoApprove: boolean;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  maxProductsPerUser: number;
};

const DEFAULT_SETTINGS: AppSettings = {
  autoApprove: false,
  maintenanceMode: false,
  allowRegistrations: true,
  maxProductsPerUser: 10,
};

let didInit = false;

async function ensureSettingsTable(): Promise<void> {
  if (didInit) return;
  didInit = true;

  // NOTE: This project does not have a Prisma model for settings.
  // We persist settings in Postgres via a tiny table managed with raw SQL.
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "app_settings" (
      id INT PRIMARY KEY,
      "autoApprove" BOOLEAN NOT NULL DEFAULT FALSE,
      "maintenanceMode" BOOLEAN NOT NULL DEFAULT FALSE,
      "allowRegistrations" BOOLEAN NOT NULL DEFAULT TRUE,
      "maxProductsPerUser" INT NOT NULL DEFAULT 10,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await prisma.$executeRaw`
    INSERT INTO "app_settings" (id, "autoApprove", "maintenanceMode", "allowRegistrations", "maxProductsPerUser")
    VALUES (1, ${DEFAULT_SETTINGS.autoApprove}, ${DEFAULT_SETTINGS.maintenanceMode}, ${DEFAULT_SETTINGS.allowRegistrations}, ${DEFAULT_SETTINGS.maxProductsPerUser})
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function getAppSettings(): Promise<AppSettings> {
  await ensureSettingsTable();

  const rows = await prisma.$queryRaw<
    Array<{
      autoApprove: boolean;
      maintenanceMode: boolean;
      allowRegistrations: boolean;
      maxProductsPerUser: number;
    }>
  >`
    SELECT
      "autoApprove" as "autoApprove",
      "maintenanceMode" as "maintenanceMode",
      "allowRegistrations" as "allowRegistrations",
      "maxProductsPerUser" as "maxProductsPerUser"
    FROM "app_settings"
    WHERE id = 1
    LIMIT 1
  `;

  const row = rows?.[0];
  if (!row) return DEFAULT_SETTINGS;

  return {
    autoApprove: Boolean(row.autoApprove),
    maintenanceMode: Boolean(row.maintenanceMode),
    allowRegistrations: Boolean(row.allowRegistrations),
    maxProductsPerUser: Number(row.maxProductsPerUser ?? DEFAULT_SETTINGS.maxProductsPerUser),
  };
}

export async function updateAppSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettings();

  const next: AppSettings = {
    autoApprove: typeof patch.autoApprove === 'boolean' ? patch.autoApprove : current.autoApprove,
    maintenanceMode: typeof patch.maintenanceMode === 'boolean' ? patch.maintenanceMode : current.maintenanceMode,
    allowRegistrations:
      typeof patch.allowRegistrations === 'boolean' ? patch.allowRegistrations : current.allowRegistrations,
    maxProductsPerUser:
      typeof patch.maxProductsPerUser === 'number' && Number.isFinite(patch.maxProductsPerUser)
        ? patch.maxProductsPerUser
        : current.maxProductsPerUser,
  };

  await prisma.$executeRaw`
    INSERT INTO "app_settings" (id, "autoApprove", "maintenanceMode", "allowRegistrations", "maxProductsPerUser", "updatedAt")
    VALUES (1, ${next.autoApprove}, ${next.maintenanceMode}, ${next.allowRegistrations}, ${next.maxProductsPerUser}, NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      "autoApprove" = EXCLUDED."autoApprove",
      "maintenanceMode" = EXCLUDED."maintenanceMode",
      "allowRegistrations" = EXCLUDED."allowRegistrations",
      "maxProductsPerUser" = EXCLUDED."maxProductsPerUser",
      "updatedAt" = NOW()
  `;

  return next;
}
