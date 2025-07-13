#!/bin/bash

# Systematic fix of all Prisma model naming issues
# Based on the Prisma schema naming conventions

echo "🔧 Fixing all Prisma model names systematically..."

# Find all TypeScript files (excluding generated and backup directories)
find . -name "*.ts" -o -name "*.tsx" | grep -v generated | grep -v backup | while read file; do
  # Fix all the problematic model names
  sed -i '' \
    -e 's/prisma\.influencer_/prisma.influencer/g' \
    -e 's/prisma\.brand_/prisma.brand/g' \
    -e 's/prisma\.product_/prisma.product/g' \
    -e 's/prisma\.order_/prisma.order/g' \
    -e 's/prisma\.campaign_/prisma.campaign/g' \
    -e 's/prisma\.supplier_/prisma.supplier/g' \
    -e 's/prisma\.api_/prisma.api/g' \
    -e 's/prisma\.inventory_/prisma.inventory/g' \
    -e 's/prisma\.commission_/prisma.commission/g' \
    -e 's/prisma\.discount_/prisma.discount/g' \
    -e 's/prisma\.scraping_/prisma.scraping/g' \
    -e 's/prisma\.influencers/prisma.influencer/g' \
    -e 's/prisma\.brands/prisma.brand/g' \
    -e 's/prisma\.products/prisma.product/g' \
    -e 's/prisma\.orders/prisma.order/g' \
    -e 's/prisma\.campaigns/prisma.campaign/g' \
    -e 's/prisma\.suppliers/prisma.supplier/g' \
    -e 's/influencer_applications/influencerApplication/g' \
    -e 's/brand_applications/brandApplication/g' \
    -e 's/influencer_socials/influencerSocial/g' \
    -e 's/influencer_categories/influencerCategory/g' \
    -e 's/influencer_products/influencerProduct/g' \
    -e 's/product_mappings/productMapping/g' \
    -e 's/supplier_api_connections/supplierApiConnection/g' \
    -e 's/inventory_logs/inventoryLog/g' \
    -e 's/order_submissions/orderSubmission/g' \
    -e 's/order_items/orderItem/g' \
    -e 's/api_notifications/apiNotification/g' \
    -e 's/discount_codes/discountCode/g' \
    -e 's/influencer_database/influencerDatabase/g' \
    -e 's/influencer_prospects/influencerProspect/g' \
    -e 's/scraping_configs/scrapingConfig/g' \
    -e 's/scraping_runs/scrapingRun/g' \
    -e 's/scraping_attempts/scrapingAttempt/g' \
    -e 's/commission_rates/commissionRate/g' \
    -e 's/\.brands\./\.brand\./g' \
    -e 's/\.products\./\.product\./g' \
    -e 's/\.campaigns\./\.campaign\./g' \
    -e 's/\.suppliers\./\.supplier\./g' \
    -e 's/\.influencers\./\.influencer\./g' \
    -e 's/\.orders\./\.order\./g' \
    "$file"
done

echo "✅ All Prisma model names fixed!"
