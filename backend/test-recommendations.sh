#!/bin/bash

# Recommendation System - Test Script
# Run this to test all recommendation endpoints
# Usage: bash test-recommendations.sh

API_URL="http://localhost:5000"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Recommendation System Test${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if API is running
echo -e "${YELLOW}Checking if API is running...${NC}"
if ! curl -s "$API_URL" > /dev/null; then
  echo -e "${RED}ERROR: API is not running at $API_URL${NC}"
  echo "Start backend with: cd backend && npm run dev"
  exit 1
fi
echo -e "${GREEN}✓ API is running${NC}"
echo ""

# Test 1: Hybrid Recommendations
echo -e "${BLUE}Test 1: Hybrid Recommendations${NC}"
echo "Endpoint: GET /recommendations/1"
curl -s "$API_URL/recommendations/1" | jq .
echo ""

# Test 2: Content-Based
echo -e "${BLUE}Test 2: Content-Based Recommendations${NC}"
echo "Endpoint: GET /recommendations/1?type=content&limit=5"
curl -s "$API_URL/recommendations/1?type=content&limit=5" | jq .
echo ""

# Test 3: Collaborative
echo -e "${BLUE}Test 3: Collaborative Recommendations${NC}"
echo "Endpoint: GET /recommendations/1?type=collaborative&limit=5"
curl -s "$API_URL/recommendations/1?type=collaborative&limit=5" | jq .
echo ""

# Test 4: Category-Based
echo -e "${BLUE}Test 4: Category-Based Recommendations${NC}"
echo "Endpoint: GET /recommendations/1?type=category&limit=5"
curl -s "$API_URL/recommendations/1?type=category&limit=5" | jq .
echo ""

# Test 5: Popular Products
echo -e "${BLUE}Test 5: Popular Products${NC}"
echo "Endpoint: GET /recommendations/popular?limit=5"
curl -s "$API_URL/recommendations/popular?limit=5" | jq .
echo ""

# Test 6: Trending Products
echo -e "${BLUE}Test 6: Trending Products${NC}"
echo "Endpoint: GET /recommendations/trending?limit=5"
curl -s "$API_URL/recommendations/trending?limit=5" | jq .
echo ""

# Test 7: Similar Products
echo -e "${BLUE}Test 7: Similar Products${NC}"
echo "Endpoint: GET /recommendations/similar/5"
curl -s "$API_URL/recommendations/similar/5" | jq .
echo ""

# Test 8: Different User
echo -e "${BLUE}Test 8: Recommendations for User 2${NC}"
echo "Endpoint: GET /recommendations/2"
curl -s "$API_URL/recommendations/2" | jq .
echo ""

# Test 9: Custom Limit
echo -e "${BLUE}Test 9: Custom Limit (20 products)${NC}"
echo "Endpoint: GET /recommendations/1?limit=20"
curl -s "$API_URL/recommendations/1?limit=20" | jq '.' | head -30
echo ""

# Test 10: Error Handling
echo -e "${BLUE}Test 10: Error Handling (Invalid userId)${NC}"
echo "Endpoint: GET /recommendations/invalid"
curl -s "$API_URL/recommendations/invalid" | jq .
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}================================${NC}"
