# Contributing to E-Commerce Recommendation System

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We expect all contributors to:

- Be respectful of differing opinions
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept responsibility and apologize when wrong
- Focus on what is best for the community

---

## 💡 How to Contribute

### Types of Contributions

We welcome contributions in many forms:

1. **Bug Reports** - Found an issue? Open an issue with details
2. **Feature Requests** - Have an idea? Suggest improvements
3. **Code Changes** - Fix bugs or add features
4. **Documentation** - Improve guides and comments
5. **Tests** - Increase code coverage
6. **Performance** - Optimize queries or components

### Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch
4. Make your changes
5. Push to your fork
6. Open a Pull Request

---

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR-USERNAME/e-commerce-recommendation.git
cd e-commerce-recommendation
```

### 2. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/e-commerce-recommendation.git
```

### 3. Create Feature Branch

```bash
# Get latest from main
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/my-awesome-feature
```

### 4. Install Dependencies

**Backend:**
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

**Frontend:**
```bash
cd frontend
npm install
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📝 Coding Standards

### General Principles

- **Keep it simple**: Write readable, understandable code
- **DRY principle**: Don't Repeat Yourself
- **SOLID principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Comments**: Explain WHY, not WHAT (code shows the what)

### JavaScript/Node.js Style

```javascript
// ✅ Good: Clear, descriptive names
const getUserRecommendations = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  return recommendationService.getForUser(userId);
};

// ❌ Bad: Unclear abbreviations
const getUR = async (uid) => {
  const u = await db.user.get(uid);
  if (!u) throw Error('not found');
  return rec.get(uid);
};
```

### React Component Style

```javascript
// ✅ Good: Clear purpose, proper JSDoc
/**
 * ProductCard component
 * @param {Object} product - Product data
 * @param {string} product.id - Product ID
 * @param {string} product.name - Product name
 * @param {function} onAddToCart - Callback when adding to cart
 */
const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Render product */}
    </div>
  );
};

export default ProductCard;

// ❌ Bad: Unclear structure
const Product = (props) => {
  return <div>{props.p.n}</div>;
};
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Variables/Functions | camelCase | `getUserRecommendations` |
| Classes/Components | PascalCase | `ProductCard`, `UserService` |
| Constants | UPPER_SNAKE_CASE | `MAX_PRODUCTS_PER_PAGE` |
| Private methods | _leading underscore | `_calculateScore()` |
| Booleans | prefix with is/has | `isLoading`, `hasError` |

### File Organization

**Backend Services**:
```
services/
├── productService.js
│   ├── getProducts()
│   ├── getProductById()
│   ├── searchProducts()
│   └── // ... other methods
├── recommendationService.js
└── ...
```

**Frontend Components**:
```
components/
├── ProductCard.js
│   ├── ProductCard (component)
│   ├── exports
│   └── // styles if co-located
├── ProductDetailClient.js
└── ...
```

---

## 💬 Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.

### Examples

```bash
# Good commit messages
git commit -m "feat(recommendations): add confidence scoring to hybrid algorithm"
git commit -m "fix(cart): prevent duplicate items when adding same product twice"
git commit -m "docs(api): add examples for recommendation endpoints"
git commit -m "refactor(services): extract common validation logic"
git commit -m "perf(database): add index on product category column"
```

### Guidelines

1. Use imperative mood ("add feature" not "added feature")
2. Don't capitalize first letter
3. No period (.) at the end
4. Keep subject < 50 characters
5. Add body for complex changes
6. Reference issues/PRs: "Fixes #123", "Relates to #456"

---

## 🔄 Pull Requests

### Before Creating PR

- [ ] Fork and clone repository
- [ ] Create feature branch from `main`
- [ ] Make your changes
- [ ] Run tests and linting
- [ ] Update documentation
- [ ] Commit messages follow guidelines
- [ ] Push to your fork

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Related Issues
Fixes #123
Relates to #456

## Testing
Describe testing done:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done

## Checklist
- [ ] Code follows project style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Changes are backward compatible
```

### PR Review Process

1. **Automated Checks**
   - Tests must pass
   - Linting must pass
   - Code coverage maintained

2. **Code Review**
   - One maintainer review minimum
   - Constructive feedback on approach
   - Discussion on design decisions

3. **Approval & Merge**
   - Approved by maintainer
   - All comments resolved
   - Squash and merge to main

---

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests
npm test

# With coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Testing Guidelines

**Unit Tests** (Services):
```javascript
describe('recommendationService', () => {
  describe('getHybridRecommendations', () => {
    it('should return products for valid user', async () => {
      // Arrange
      const userId = 'user123';
      
      // Act
      const result = await service.getHybridRecommendations(userId);
      
      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].confidence).toBeGreaterThan(0.5);
    });

    it('should throw error for invalid user', async () => {
      await expect(
        service.getHybridRecommendations('invalid')
      ).rejects.toThrow('User not found');
    });
  });
});
```

**Integration Tests** (API):
```javascript
describe('GET /recommendations/:userId', () => {
  it('should return 200 with recommendations', async () => {
    const res = await request(app)
      .get('/recommendations/user123')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 404 for invalid user', async () => {
    await request(app)
      .get('/recommendations/invalid')
      .expect(404);
  });
});
```

---

## 📚 Documentation

### Code Comments

Good comments explain **WHY** not **WHAT**:

```javascript
// ✅ Good: Explains reasoning
// Using 0.8x for purchases because they signal stronger intent
// than views (which might be accidental clicks)
const PURCHASE_WEIGHT = 0.8;
const VIEW_WEIGHT = 0.2;

// ❌ Bad: Repeats what code already says
// Set purchase weight to 0.8
const PURCHASE_WEIGHT = 0.8;
```

### JSDoc for Public APIs

```javascript
/**
 * Calculate recommendation score for products
 * 
 * @param {string} userId - The user ID
 * @param {Array<Object>} products - Products to score
 * @param {Object} options - Configuration options
 * @param {number} options.weights - Algorithm weights
 * @returns {Promise<Array<Object>>} Scored products sorted by score
 * @throws {ValidationError} If userId is invalid
 * 
 * @example
 * const scored = await scoreProducts('user123', products);
 */
const scoreProducts = (userId, products, options = {}) => {
  // Implementation
};
```

### README Updates

When adding features, update [README.md](README.md):

- Add to features list with ✅ checkmark
- Add API endpoints if applicable  
- Add to future roadmap if incomplete

### Architecture Decisions

For significant changes, document in [ARCHITECTURE.md](ARCHITECTURE.md):

- What problem were you solving?
- Why this approach?
- What alternatives were considered?
- Trade-offs made

---

## 🚀 Merging PRs

### For Maintainers

1. Ensure all checks pass
2. Review code and comments
3. Verify tests cover changes
4. Approve PR
5. **Squash and merge** to main: `git merge --squash`
6. Delete feature branch

### Post-Merge

- [ ] Verify main branch is working
- [ ] Update version if needed
- [ ] Create release notes if new version

---

## 📞 Questions or Need Help?

- **Issues**: Check existing issues first
- **Discussions**: Start a discussion for questions
- **Email**: [contact information if provided]

---

## 🎯 Contributing Areas Needing Help

We especially welcome contributions in these areas:

1. **Performance Optimization**
   - Database query optimization
   - Frontend bundle size reduction
   - Recommendation algorithm efficiency

2. **Features**
   - User authentication improvements
   - Advanced filtering options
   - Real-time notifications

3. **Testing**
   - Increase test coverage
   - Add E2E tests
   - Performance benchmarks

4. **Documentation**
   - API documentation
   - Tutorial improvements
   - Code examples

5. **Accessibility**
   - WCAG compliance improvements
   - Screen reader support
   - Keyboard navigation

---

## 📜 License

By contributing, you agree that your contributions will be licensed under its MIT License.

---

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your effort and time!

**Happy contributing! 🚀**
