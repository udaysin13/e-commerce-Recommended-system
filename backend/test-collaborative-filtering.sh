#!/bin/bash

# Collaborative Filtering Recommendations - API Testing Guide
# This file demonstrates how to test the collaborative filtering endpoints

echo "=========================================="
echo "Collaborative Filtering Recommendations"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000/api"
USER_ID=1
TOKEN="your_jwt_token_here"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Get Collaborative Filtering Recommendations${NC}"
echo "GET /recommendations/:userId/collaborative-filtering"
echo "Parameters:"
echo "  - topK: Number of similar users to consider (default: 10, max: 100)"
echo "  - minSimilarity: Minimum similarity threshold (default: 0.3, range: 0-1)"
echo "  - limit: Number of recommendations (default: 10, max: 50)"
echo ""

echo -e "${YELLOW}Basic request (default parameters):${NC}"
echo "curl -X GET '$BASE_URL/recommendations/$USER_ID/collaborative-filtering' \\"
echo "  -H 'Authorization: Bearer $TOKEN'"
echo ""

echo -e "${YELLOW}With custom parameters:${NC}"
echo "curl -X GET '$BASE_URL/recommendations/$USER_ID/collaborative-filtering?topK=15&minSimilarity=0.4&limit=20' \\"
echo "  -H 'Authorization: Bearer $TOKEN'"
echo ""

echo -e "${YELLOW}Strict similarity threshold (higher quality, fewer results):${NC}"
echo "curl -X GET '$BASE_URL/recommendations/$USER_ID/collaborative-filtering?minSimilarity=0.6&limit=5' \\"
echo "  -H 'Authorization: Bearer $TOKEN'"
echo ""

echo -e "${BLUE}2. Analyze User Similarity Distribution${NC}"
echo "GET /recommendations/:userId/collaborative-filtering/analysis"
echo "Purpose: Debug endpoint to understand user's similarity neighborhood"
echo ""

echo -e "${YELLOW}Get similarity analysis:${NC}"
echo "curl -X GET '$BASE_URL/recommendations/$USER_ID/collaborative-filtering/analysis' \\"
echo "  -H 'Authorization: Bearer $TOKEN'"
echo ""

echo -e "${BLUE}Response Examples:${NC}"
echo "-----------------------"
echo ""

echo -e "${YELLOW}Success Response (Collaborative Filtering):${NC}"
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
      "similarityScore": 0.85,
      "fromSimilarUsers": 3,
      "relevanceScore": 0.712,
      "reason": "Similar users purchased this"
    },
    {
      "productId": 8,
      "productName": "USB-C Cable",
      "category": "electronics",
      "price": 12.99,
      "similarityScore": 0.72,
      "fromSimilarUsers": 2,
      "relevanceScore": 0.654,
      "reason": "Popular among similar users"
    }
  ],
  "count": 2,
  "parameters": {
    "topK": 10,
    "minSimilarity": 0.3,
    "limit": 10
  }
}
EOF
echo ""

echo -e "${YELLOW}Success Response (Similarity Analysis):${NC}"
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
      { "userId": 3, "similarity": 0.87 },
      { "userId": 7, "similarity": 0.82 }
    ]
  },
  "recommendation": "Good similarity distribution"
}
EOF
echo ""

echo -e "${BLUE}3. Algorithm Explanation${NC}"
echo "-----------------------"
echo ""
echo "Collaborative Filtering uses Cosine Similarity to:"
echo "1. Build interaction vectors for all users (products they viewed/purchased)"
echo "2. Calculate similarity between target user and all other users"
echo "3. Find users with similarity above threshold (default: 0.3)"
echo "4. Collect products from similar users"
echo "5. Score products by weighted similarity"
echo "6. Return top N recommendations"
echo ""
echo "Weighting:"
echo "  - User view: 1 point"
echo "  - User purchase: 2 points (more significant)"
echo "  - Product from similar user's purchases: 2x weight"
echo "  - Product from similar user's views: 1x weight"
echo ""

echo -e "${BLUE}4. Integration Examples${NC}"
echo "-----------------------"
echo ""

echo -e "${YELLOW}JavaScript/Fetch:${NC}"
cat << 'EOF'
const userId = 1;
const topK = 15;
const minSimilarity = 0.4;

const response = await fetch(
  `http://localhost:3000/api/recommendations/${userId}/collaborative-filtering?topK=${topK}&minSimilarity=${minSimilarity}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
console.log(data.recommendations);
EOF
echo ""

echo -e "${YELLOW}React Component Pattern:${NC}"
cat << 'EOF'
function CollaborativeRecommendations({ userId, token }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/recommendations/${userId}/collaborative-filtering?topK=15&minSimilarity=0.4`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        const data = await res.json();
        setRecs(data.recommendations);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [userId, token]);

  return (
    <div>
      {loading ? <p>Loading...</p> : recs.map(rec => (
        <ProductCard key={rec.productId} product={rec} />
      ))}
    </div>
  );
}
EOF
echo ""

echo -e "${BLUE}5. Comparison with Other Algorithms${NC}"
echo "-----------------------"
echo ""
cat << 'EOF'
Algorithm              | Use Case
----------------------|--------------------------------------------
Collaborative (v1)     | Simple co-purchase recommendations
Collaborative (CF)     | User-user similarity based personalization
Content-Based          | Products similar to user's viewed/purchased items
Category-Based         | Products from user's favorite categories
Trending               | Popular products across all users
Hybrid                 | Combines multiple algorithms for best results
EOF
echo ""

echo -e "${BLUE}6. Performance Considerations${NC}"
echo "-----------------------"
echo ""
echo "Scaling Notes:"
echo "  - With 10,000 users: ~100ms to compute similarity scores"
echo "  - With 100,000 users: ~1000ms (1 second)"
echo "  - Consider caching for large user bases"
echo ""
echo "Optimization Strategies:"
echo "  1. Batch compute similarities periodically"
echo "  2. Cache similarity matrix (daily refresh)"
echo "  3. Use incremental similarity updates"
echo "  4. Parallel process user vector calculations"
echo "  5. Set appropriate topK limit (10-20 usually optimal)"
echo ""

echo -e "${GREEN}========== END OF TESTING GUIDE ==========${NC}"
