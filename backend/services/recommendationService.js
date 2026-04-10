const dataStore = require("../lib/dataStore");

async function getSimilarProducts(productId) {
  return dataStore.getSimilarProducts(productId);
}

async function getContentBasedRecommendations(userId) {
  return dataStore.getHybridRecommendations(userId);
}

async function getCollaborativeRecommendations(userId) {
  return dataStore.getHybridRecommendations(userId);
}

async function getHybridRecommendations(userId) {
  return dataStore.getHybridRecommendations(userId);
}

module.exports = {
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations,
  getSimilarProducts,
};
