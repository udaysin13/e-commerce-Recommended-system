#!/bin/bash

# ============================================================================
# COLLABORATIVE FILTERING API - COMPREHENSIVE TESTING GUIDE
# ============================================================================
# This file contains ready-to-use cURL commands for testing the collaborative
# filtering recommendation system with expected responses.
#
# Setup:
# 1. Replace YOUR_JWT_TOKEN with actual token from login
# 2. Replace localhost:3000 with your actual API URL if different
# 3. Run individual sections or the entire script
# ============================================================================

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api"
USER_ID=1
ANOTHER_USER_ID=2
JWT_TOKEN="your_jwt_token_here"

# Helper function to print sections
section() {
  echo -e "\n${BLUE}===============================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===============================================================${NC}\n"
}

# Helper function to print instructions
instruction() {
  echo -e "${YELLOW}→ $1${NC}\n"
}

# ============================================================================
# SECTION 1: BASIC REQUESTS
# ============================================================================
section "SECTION 1: BASIC REQUESTS"

instruction "1.1 Default Collaborative Filtering Recommendations"
echo "Request:"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering
Authorization: Bearer YOUR_JWT_TOKEN
EOF

echo -e "\ncURL Command:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
EOF

echo -e "\nExpected Response (200 OK):"
cat << 'EOF'
{
  "userId": 1,
  "algorithm": "Collaborative Filtering (Cosine Similarity)",
  "recommendations": [
    {
      "productId": 5,
      "productName": "Wireless Headphones",
      "category": "electronics",
      "price": 79.99,
      "description": "High quality wireless headphones with noise cancellation",
      "imageUrl": "https://...",
      "similarityScore": 0.85,
      "fromSimilarUsers": 3,
      "relevanceScore": 0.712,
      "reason": "Similar users purchased this"
    }
  ],
  "count": 1,
  "parameters": {
    "topK": 10,
    "minSimilarity": 0.3,
    "limit": 10
  }
}
EOF

echo ""

# ============================================================================
# SECTION 2: PARAMETER VARIATIONS
# ============================================================================
section "SECTION 2: PARAMETER VARIATIONS"

instruction "2.1 Strict Matching (Higher Quality)"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering?topK=5&minSimilarity=0.6&limit=5
Authorization: Bearer YOUR_JWT_TOKEN

cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering?topK=5&minSimilarity=0.6&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Scenario: Use for curated premium recommendations where quality > quantity
Result: Fewer but higher-confidence recommendations
EOF

echo ""

instruction "2.2 Generous Matching (Broader Coverage)"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering?topK=20&minSimilarity=0.2&limit=20
Authorization: Bearer YOUR_JWT_TOKEN

cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering?topK=20&minSimilarity=0.2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Scenario: Use for exploration or discovery where options > precision
Result: More recommendations with broader user base
EOF

echo ""

instruction "2.3 Balanced Approach (Recommended)"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering?topK=10&minSimilarity=0.35&limit=12
Authorization: Bearer YOUR_JWT_TOKEN

cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering?topK=10&minSimilarity=0.35&limit=12" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Scenario: Production default - good quality and coverage balance
Result: 12 well-matched recommendations from top 10 similar users
EOF

echo ""

# ============================================================================
# SECTION 3: ANALYSIS ENDPOINT
# ============================================================================
section "SECTION 3: ANALYSIS ENDPOINT"

instruction "3.1 Get User Similarity Analysis"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering/analysis
Authorization: Bearer YOUR_JWT_TOKEN

Purpose: Understand user's similarity neighborhood and recommendation quality

cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering/analysis" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo ""

instruction "3.2 Expected Analysis Response"
cat << 'EOF'
{
  "userId": 1,
  "analysis": {
    "totalSimilarUsers": 5,
    "averageSimilarity": 0.52,
    "maxSimilarity": 0.87,
    "minSimilarity": 0.31,
    "similarityDistribution": {
      "0.8-1.0": 2,
      "0.6-0.8": 2,
      "0.4-0.6": 1,
      "0.2-0.4": 0,
      "0.0-0.2": 0
    },
    "topSimilarUsers": [
      {
        "userId": 3,
        "similarity": 0.87,
        "commonProducts": 4,
        "sharedPurchases": 2
      },
      {
        "userId": 7,
        "similarity": 0.82,
        "commonProducts": 3,
        "sharedPurchases": 1
      }
    ]
  },
  "recommendation": "Good similarity distribution"
}
EOF

echo ""

instruction "3.3 Interpreting Analysis Results"
cat << 'EOF'
Quality Assessment:
  - averageSimilarity < 0.3 → Low   (isolated user, limited recs)
  - averageSimilarity 0.3-0.5 → Medium (decent recommendations)
  - averageSimilarity > 0.5 → High  (very personalized recs)

totalSimilarUsers:
  - < 3 → Few similar users, use hybrid approach
  - 3-10 → Good neighborhood
  - > 10 → Excellent, diverse similar users

Distribution peaks:
  - 0.8-1.0 (high) → Very similar users for reference
  - 0.4-0.8 (medium) → Good variety of recommendations
  - < 0.4 (low) → Diluted signal, lower confidence
EOF

echo ""

# ============================================================================
# SECTION 4: ERROR CASES
# ============================================================================
section "SECTION 4: ERROR CASES & RESPONSES"

instruction "4.1 Invalid User ID"
cat << 'EOF'
Request:
GET /api/recommendations/invalid/collaborative-filtering
Authorization: Bearer YOUR_JWT_TOKEN

Response (400 Bad Request):
{
  "error": "Invalid user ID"
}
EOF

echo ""

instruction "4.2 Missing Authentication"
cat << 'EOF'
Request:
GET /api/recommendations/1/collaborative-filtering
(No Authorization header)

Response (401 Unauthorized):
{
  "error": "Authentication required"
}
EOF

echo ""

instruction "4.3 User Not Found"
cat << 'EOF'
Request:
GET /api/recommendations/99999/collaborative-filtering
Authorization: Bearer YOUR_JWT_TOKEN

Response (404 Not Found):
{
  "error": "User not found"
}
EOF

echo ""

instruction "4.4 Invalid Parameters"
cat << 'EOF'
Request:
GET /api/recommendations/1/collaborative-filtering?topK=abc&minSimilarity=2
Authorization: Bearer YOUR_JWT_TOKEN

Response (200 OK with defaults):
{
  "userId": 1,
  "recommendations": [...],
  "parameters": {
    "topK": 10,      # Invalid value ignored, default used
    "minSimilarity": 1,  # Capped at valid range
    "limit": 10
  }
}
EOF

echo ""

# ============================================================================
# SECTION 5: BATCH OPERATIONS
# ============================================================================
section "SECTION 5: BATCH OPERATIONS (Multiple Users)"

instruction "5.1 Sequential Requests for Multiple Users"
cat << 'EOF'
Get recommendations for multiple users by making separate requests:

User 1:
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

User 2:
curl -X GET "http://localhost:3000/api/recommendations/2/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

User 3:
curl -X GET "http://localhost:3000/api/recommendations/3/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Typical Time: 100-500ms per user depending on user count in system
EOF

echo ""

instruction "5.2 Parallel Batch with xargs (efficient)"
cat << 'EOF'
# Get recommendations for users 1-10 in parallel
seq 1 10 | xargs -I {} \
  curl -s -X GET "http://localhost:3000/api/recommendations/{}/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
EOF

echo ""

# ============================================================================
# SECTION 6: FRONTEND INTEGRATION
# ============================================================================
section "SECTION 6: FRONTEND INTEGRATION EXAMPLES"

instruction "6.1 JavaScript Fetch API"
cat << 'EOF'
async function getRecommendations(userId) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({
    topK: 15,
    minSimilarity: 0.4,
    limit: 10
  });

  const response = await fetch(
    `http://localhost:3000/api/recommendations/${userId}/collaborative-filtering?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}

// Usage
const recs = await getRecommendations(1);
console.log(recs.recommendations);
EOF

echo ""

instruction "6.2 React Hook with Error Handling"
cat << 'EOF'
import { useState, useEffect } from 'react';

function useCollaborativeRecommendations(userId) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/recommendations/${userId}/collaborative-filtering`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchRecommendations();
  }, [userId]);

  return { recommendations, loading, error };
}

// Usage in component
export function RecommendationsList({ userId }) {
  const { recommendations, loading, error } = useCollaborativeRecommendations(userId);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return recommendations.map(rec => (
    <ProductCard key={rec.productId} {...rec} />
  ));
}
EOF

echo ""

# ============================================================================
# SECTION 7: RESPONSE TIME BENCHMARKING
# ============================================================================
section "SECTION 7: RESPONSE TIME BENCHMARKING"

instruction "7.1 Measure Single Request Time"
cat << 'EOF'
# Using curl with time measurement
time curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Using curl -w option
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -w "\n\nTotal time: %{time_total}s\n"

# Detailed timing breakdown
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -w "\nTime breakdown:\n" \
  -w "  Connect: %{time_connect}s\n" \
  -w "  TTFB: %{time_starttransfer}s\n" \
  -w "  Total: %{time_total}s\n"
EOF

echo ""

instruction "7.2 Load Test with Apache Bench"
cat << 'EOF'
# Make 100 requests with concurrency of 10
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/recommendations/1/collaborative-filtering

# This will show:
# - Requests per second
# - Time per request
# - Failed requests
# - Response time distribution
EOF

echo ""

instruction "7.3 Load Test with wrk"
cat << 'EOF'
# Use wrk for more detailed load testing
wrk -t4 -c10 -d30s \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/recommendations/1/collaborative-filtering

# Parameters:
# -t4 = 4 threads
# -c10 = 10 concurrent connections
# -d30s = run for 30 seconds
EOF

echo ""

# ============================================================================
# SECTION 8: DEBUGGING & MONITORING
# ============================================================================
section "SECTION 8: DEBUGGING & MONITORING"

instruction "8.1 Verbose cURL Output (Full Headers)"
cat << 'EOF'
curl -v -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Output includes:
# - Request headers sent
# - Response headers received
# - Response body
# - Timing information
# - Connection details
EOF

echo ""

instruction "8.2 Check Actual Similarity Scores"
cat << 'EOF'
# Get analysis to see actual similarity distribution
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering/analysis" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.analysis'

# Check quality of recommendations
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | \
  jq '.recommendations[] | {productId, similarityScore, fromSimilarUsers}'
EOF

echo ""

instruction "8.3 Monitor Real-time Performance"
cat << 'EOF'
# Repeated requests to see consistency
for i in {1..5}; do
  echo "Request $i:"
  time curl -s -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.count'
done
EOF

echo ""

# ============================================================================
# SECTION 9: PRODUCTION CONFIGURATIONS
# ============================================================================
section "SECTION 9: PRODUCTION CONFIGURATIONS"

instruction "9.1 Strict Quality (Luxury Items)"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering?topK=5&minSimilarity=0.65&limit=3

Use for:
- High-value items (premium watches, jewelry)
- Enterprise sales
- VIP customer targeting

Characteristics:
- Only shows products from highly similar users
- Fewer but highest-confidence recommendations
- ~50-100ms computation time
EOF

echo ""

instruction "9.2 Balanced Production (E-commerce)"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering?topK=10&minSimilarity=0.35&limit=10

Use for:
- Regular e-commerce sites
- Default recommendation widget
- Homepage personalization

Characteristics:
- Good quality and coverage balance
- Typical production configuration
- ~100-200ms computation time
EOF

echo ""

instruction "9.3 Discovery Focused (Marketplace)"
cat << 'EOF'
GET /api/recommendations/1/collaborative-filtering?topK=25&minSimilarity=0.15&limit=25

Use for:
- Broad product catalogs
- Discovery-focused experiences
- New item exploration

Characteristics:
- Broader user base considered
- Higher variety of recommendations
- ~200-500ms computation time
EOF

echo ""

# ============================================================================
# SECTION 10: QUICK COPY-PASTE REFERENCE
# ============================================================================
section "SECTION 10: QUICK COPY-PASTE REFERENCE"

echo "Default Request:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo ""

echo "Analysis Request:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering/analysis" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo ""

echo "With Custom Parameters:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering?topK=15&minSimilarity=0.4&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo ""

echo "Pretty Print JSON (requires jq):"
cat << 'EOF'
curl -s -X GET "http://localhost:3000/api/recommendations/1/collaborative-filtering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.'
EOF

echo ""

echo -e "${GREEN}================ END OF TESTING GUIDE ================${NC}"
echo ""
echo "📚 For more information:"
echo "   - Full guide: COLLABORATIVE_FILTERING_GUIDE.md"
echo "   - Quick ref: COLLABORATIVE_FILTERING_QUICK_REFERENCE.md"
echo "   - Service: backend/services/collaborativeFilteringService.js"
echo "   - Controller: backend/controllers/collaborativeFilteringController.js"
echo ""
