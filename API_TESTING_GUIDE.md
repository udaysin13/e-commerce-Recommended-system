#!/bin/bash

# Advanced Recommendation System - Testing Guide
# This script contains curl commands to test all intermediate-level recommendations
# Replace user IDs and product IDs with your test data

API_URL="http://localhost:5000"
TEST_USER_ID=1
TEST_PRODUCT_ID=5
PRODUCT_ID_2=3

echo "=========================================="
echo "Advanced Recommendation System - Testing"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
run_test() {
  local test_name=$1
  local curl_cmd=$2
  
  echo -e "${YELLOW}Testing: ${test_name}${NC}"
  echo "Command: ${curl_cmd}"
  echo ""
  
  eval "${curl_cmd}"
  
  echo ""
  echo "---"
  echo ""
}

# ============================================
# 1. TRACK USER VIEWS
# ============================================

echo -e "${GREEN}1. TRACKING USER VIEWS${NC}"
echo "Description: Records when users view products"
echo ""

run_test "Track view for product 1" \
  "curl -X POST '${API_URL}/advanced-recommendations/track-view' \
    -H 'Content-Type: application/json' \
    -d '{\"userId\": ${TEST_USER_ID}, \"productId\": 1}'"

run_test "Track view for product 2" \
  "curl -X POST '${API_URL}/advanced-recommendations/track-view' \
    -H 'Content-Type: application/json' \
    -d '{\"userId\": ${TEST_USER_ID}, \"productId\": 2}'"

run_test "Track view for product 3" \
  "curl -X POST '${API_URL}/advanced-recommendations/track-view' \
    -H 'Content-Type: application/json' \
    -d '{\"userId\": ${TEST_USER_ID}, \"productId\": ${PRODUCT_ID_2}}'"

run_test "Track view for product 4" \
  "curl -X POST '${API_URL}/advanced-recommendations/track-view' \
    -H 'Content-Type: application/json' \
    -d '{\"userId\": ${TEST_USER_ID}, \"productId\": 4}'"

run_test "Track view for product 5" \
  "curl -X POST '${API_URL}/advanced-recommendations/track-view' \
    -H 'Content-Type: application/json' \
    -d '{\"userId\": ${TEST_USER_ID}, \"productId\": ${TEST_PRODUCT_ID}}'"

# ============================================
# 2. SMART RECOMMENDATIONS
# ============================================

echo -e "${GREEN}2. SMART RECOMMENDATIONS${NC}"
echo "Description: Combines all signals - views, purchases, similar users"
echo ""

run_test "Get smart recommendations (default - 12)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}' \
    -H 'Content-Type: application/json'"

run_test "Get smart recommendations (limit 6)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}?limit=6' \
    -H 'Content-Type: application/json'"

run_test "Get smart recommendations with product context" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}?product_id=${TEST_PRODUCT_ID}&limit=6' \
    -H 'Content-Type: application/json'"

# ============================================
# 3. USERS ALSO BOUGHT
# ============================================

echo -e "${GREEN}3. USERS ALSO BOUGHT (CO-PURCHASE ANALYSIS)${NC}"
echo "Description: What users bought together with a specific product"
echo ""

run_test "Users also bought - Product 1" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/users-also-bought?product_id=1&limit=8' \
    -H 'Content-Type: application/json'"

run_test "Users also bought - Product 5 (test product)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/users-also-bought?product_id=${TEST_PRODUCT_ID}&limit=8' \
    -H 'Content-Type: application/json'"

# ============================================
# 4. ADVANCED COLLABORATIVE FILTERING
# ============================================

echo -e "${GREEN}4. ADVANCED COLLABORATIVE FILTERING${NC}"
echo "Description: Finds similar users and their purchases with confidence scores"
echo ""

run_test "Collaborative filtering - default (8)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/collaborative-advanced' \
    -H 'Content-Type: application/json'"

run_test "Collaborative filtering - limit 6" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/collaborative-advanced?limit=6' \
    -H 'Content-Type: application/json'"

# ============================================
# 5. ADVANCED CONTENT-BASED
# ============================================

echo -e "${GREEN}5. ADVANCED CONTENT-BASED RECOMMENDATIONS${NC}"
echo "Description: Based on category preferences detected from browsing history"
echo ""

run_test "Content-based recommendations (8)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/content-advanced' \
    -H 'Content-Type: application/json'"

run_test "Content-based recommendations (limit 6)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/content-advanced?limit=6' \
    -H 'Content-Type: application/json'"

# ============================================
# 6. USER BEHAVIOR ANALYTICS
# ============================================

echo -e "${GREEN}6. USER BEHAVIOR ANALYTICS${NC}"
echo "Description: User engagement metrics and classification"
echo ""

run_test "Get user behavior analytics" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/behavior' \
    -H 'Content-Type: application/json'"

# ============================================
# 7. PRODUCT ANALYTICS
# ============================================

echo -e "${GREEN}7. PRODUCT ANALYTICS${NC}"
echo "Description: Product performance metrics (views, purchases, conversion rate)"
echo ""

run_test "Product 1 analytics" \
  "curl '${API_URL}/advanced-recommendations/product/1/metadata' \
    -H 'Content-Type: application/json'"

run_test "Product 5 analytics (test product)" \
  "curl '${API_URL}/advanced-recommendations/product/${TEST_PRODUCT_ID}/metadata' \
    -H 'Content-Type: application/json'"

# ============================================
# 8. RECOMMENDATION ANALYSIS
# ============================================

echo -e "${GREEN}8. COMPREHENSIVE RECOMMENDATION ANALYSIS${NC}"
echo "Description: Shows why recommendations are made with detailed explanations"
echo ""

run_test "Get recommendation analysis (basic)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/analysis' \
    -H 'Content-Type: application/json'"

run_test "Get analysis with product context" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/analysis?product_id=${TEST_PRODUCT_ID}&limit=6' \
    -H 'Content-Type: application/json'"

# ============================================
# RESPONSE VERIFICATION
# ============================================

echo -e "${GREEN}RESPONSE VERIFICATION CHECKLIST${NC}"
echo ""
echo "After running the above tests, verify the responses:"
echo ""
echo "✓ Track View Response should include:"
echo "  - success: true"
echo "  - tracked: { userId, productId, viewedAt }"
echo ""
echo "✓ Smart Recommendations should include:"
echo "  - recommendations: [array of products with scores]"
echo "  - userBehavior: { views, purchases, category }"
echo "  - algorithm: 'Smart (Behavior-Aware)'"
echo "  - dataQuality: 'high|medium|low'"
echo ""
echo "✓ Users Also Bought should include:"
echo "  - recommendations: [products with co-occurrence data]"
echo "  - percentBoughtTogether: '70%' format"
echo "  - ordersAnalyzed: [count]"
echo ""
echo "✓ Collaborative should include:"
echo "  - recommendations: [products with confidence %]"
echo "  - similarUsersCount: [count]"
echo "  - averageConfidence: [%]"
echo ""
echo "✓ Content-Based should include:"
echo "  - recommendations: [products matching categories]"
echo "  - preferredCategories: [array]"
echo "  - interpretation: [text]"
echo ""
echo "✓ Behavior Analytics should include:"
echo "  - userId: [id]"
echo "  - userType: 'Loyal Customer|Repeat Customer|..'"
echo "  - engagement: { views, purchases, conversionRate }"
echo ""
echo "✓ Product Analytics should include:"
echo "  - analytics: { views, purchases, conversionRate }"
echo "  - recommendation: { score, quality }"
echo ""
echo "✓ Analysis should include:"
echo "  - userProfile: { type, engagement, loyalty }"
echo "  - recommendations: [array with sources]"
echo "  - dataQuality: { hasViewHistory, hasPurchaseHistory, ... }"
echo ""

# ============================================
# PERFORMANCE TESTING
# ============================================

echo -e "${GREEN}PERFORMANCE TESTING${NC}"
echo ""
echo "To measure response times, use this pattern:"
echo ""
echo "time curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}' 2>/dev/null | jq '.'"
echo ""
echo "Expected response times:"
echo "  - Smart Recs: 200-400ms"
echo "  - Users Also Bought: 100-200ms"
echo "  - Collaborative: 300-500ms"
echo "  - Content-Based: 150-300ms"
echo "  - Behavior Analytics: 50-150ms"
echo "  - Product Analytics: 50-100ms"
echo "  - Track View: 30-50ms"
echo "  - Analysis: 500-800ms"
echo ""

# ============================================
# ERROR TESTING
# ============================================

echo -e "${GREEN}ERROR HANDLING TESTING${NC}"
echo ""

run_test "Invalid user ID (should fail gracefully)" \
  "curl '${API_URL}/advanced-recommendations/invalid' \
    -H 'Content-Type: application/json'"

run_test "Missing product_id for users-also-bought (should show error)" \
  "curl '${API_URL}/advanced-recommendations/${TEST_USER_ID}/users-also-bought' \
    -H 'Content-Type: application/json'"

run_test "Track view without userId (should fail)" \
  "curl -X POST '${API_URL}/advanced-recommendations/track-view' \
    -H 'Content-Type: application/json' \
    -d '{\"productId\": 5}'"

# ============================================
# SUMMARY
# ============================================

echo ""
echo -e "${GREEN}=========================================="
echo "Testing Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review all responses for correct format"
echo "2. Verify data quality indicators"
echo "3. Check response times match expectations"
echo "4. Test error cases handled gracefully"
echo "5. Review documentation: ADVANCED_RECOMMENDATIONS_GUIDE.md"
echo ""
echo "For frontend integration, use these functions from lib/api.js:"
echo "  - trackProductView(userId, productId)"
echo "  - fetchSmartRecommendations(userId, options)"
echo "  - fetchUsersAlsoBought(userId, productId, limit)"
echo "  - fetchAdvancedCollaborative(userId, limit)"
echo "  - fetchAdvancedContentBased(userId, limit)"
echo "  - fetchUserBehaviorAnalytics(userId)"
echo "  - fetchProductAnalytics(productId)"
echo "  - fetchRecommendationAnalysis(userId, options)"
echo ""
