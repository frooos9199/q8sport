import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '../../../../lib/auth';
import { getAppSettings, updateAppSettings } from '../../../../lib/appSettings';

// GET /api/admin/settings
export const GET = requireAdmin(async (_request: AuthenticatedRequest) => {
  const settings = await getAppSettings();
  return NextResponse.json({ success: true, settings });
});

// PATCH /api/admin/settings
export const PATCH = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();

    const patch: {
      autoApprove?: boolean;
      maintenanceMode?: boolean;
      allowRegistrations?: boolean;
      maxProductsPerUser?: number;
    } = {};

    if (typeof body?.autoApprove === 'boolean') patch.autoApprove = body.autoApprove;
    if (typeof body?.maintenanceMode === 'boolean') patch.maintenanceMode = body.maintenanceMode;
    if (typeof body?.allowRegistrations === 'boolean') patch.allowRegistrations = body.allowRegistrations;

    if (typeof body?.maxProductsPerUser === 'number' && Number.isFinite(body.maxProductsPerUser)) {
      patch.maxProductsPerUser = Math.max(0, Math.floor(body.maxProductsPerUser));
    }

    const settings = await updateAppSettings(patch);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
});
