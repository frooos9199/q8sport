-- تحديث جميع المنتجات من INACTIVE إلى ACTIVE (موافقة تلقائية)
UPDATE "Product"
SET status = 'ACTIVE'
WHERE status = 'INACTIVE';

-- تحديث جميع العروض من PENDING إلى APPROVED (موافقة تلقائية)
UPDATE "Showcase"
SET status = 'APPROVED'
WHERE status = 'PENDING';

-- تحديث إعدادات التطبيق لتفعيل الموافقة التلقائية
UPDATE "app_settings"
SET "autoApprove" = TRUE
WHERE id = 1;

-- عرض النتائج
SELECT 'Products updated:' as info, COUNT(*) as count FROM "Product" WHERE status = 'ACTIVE';
SELECT 'Showcases updated:' as info, COUNT(*) as count FROM "Showcase" WHERE status = 'APPROVED';
SELECT 'AutoApprove setting:' as info, "autoApprove" as value FROM "app_settings" WHERE id = 1;
