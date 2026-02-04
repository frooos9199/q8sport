#!/bin/bash

# Apple Guideline 1.2 - Safety Features Deployment Script
# This script deploys all user-generated content moderation features

echo "🚀 Deploying Apple Guideline 1.2 Safety Features..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"
echo ""

# Step 2: Push Database Schema
echo "🗄️  Step 2: Pushing database schema changes..."
npx prisma db push --skip-generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    exit 1
fi
echo "✅ Database schema updated"
echo ""

# Step 3: Seed Bad Words
echo "🌱 Step 3: Seeding bad words database..."
node scripts/seed-bad-words.js
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to seed bad words (optional)"
else
    echo "✅ Bad words database seeded"
fi
echo ""

# Step 4: Build Application
echo "🔨 Step 4: Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build application"
    exit 1
fi
echo "✅ Application built successfully"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DEPLOYMENT COMPLETE ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Features Deployed:"
echo "   1. ✓ Terms of Service (EULA) with zero-tolerance policy"
echo "   2. ✓ Content filtering system"
echo "   3. ✓ Content reporting mechanism"
echo "   4. ✓ User blocking system"
echo "   5. ✓ Admin moderation dashboard"
echo "   6. ✓ 24-hour response commitment"
echo ""
echo "📋 Database Models Added:"
echo "   • ContentReport"
echo "   • BlockedUser"
echo "   • ModerationAction"
echo "   • BannedContent"
echo "   • BadWord"
echo ""
echo "🔗 New API Endpoints:"
echo "   • POST   /api/moderation/report"
echo "   • GET    /api/moderation/report (admin)"
echo "   • POST   /api/moderation/block"
echo "   • DELETE /api/moderation/block"
echo "   • GET    /api/moderation/block"
echo "   • POST   /api/moderation/action (admin)"
echo "   • GET    /api/moderation/action (admin)"
echo ""
echo "📱 New Pages:"
echo "   • /terms (updated with policies)"
echo "   • /admin/moderation"
echo ""
echo "🧩 New Components:"
echo "   • <ReportButton />"
echo "   • <BlockButton />"
echo ""
echo "📖 Documentation:"
echo "   • APPLE_GUIDELINE_1_2_COMPLIANCE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Next Steps:"
echo "   1. Start the application: npm run dev"
echo "   2. Test reporting system"
echo "   3. Test blocking system"
echo "   4. Verify admin dashboard access"
echo "   5. Resubmit to Apple App Review"
echo ""
echo "📞 Support: support@q8sportcar.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
