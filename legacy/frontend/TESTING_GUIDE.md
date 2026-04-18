# ✅ Frontend Testing Guide

## Manual Testing Checklist

### 🏠 Home Page Tests

#### Layout & Navigation
- [ ] Navbar is visible at top with logo and status
- [ ] Footer is visible at bottom
- [ ] Page background gradient loads smoothly
- [ ] All text is readable with good contrast

#### Hero Section
- [ ] Hero section displays with proper formatting
- [ ] Heading is centered and uses gradient text
- [ ] Section label with blue badge shows
- [ ] Stats cards display connection status

#### Search Functionality
- [ ] Search input is visible and interactive
- [ ] Typing in search updates the input
- [ ] Search results update products list
- [ ] Pagination resets to page 1 on search
- [ ] Clear search shows all products again

#### Product Grid
- [ ] Products load on page load
- [ ] Grid is responsive:
  - Mobile (1 column)
  - Tablet (2 columns)
  - Desktop (4 columns)
- [ ] Product cards display all info:
  - Product name
  - Category badge
  - Price (formatted with rupees)
  - Description text
  - View button
- [ ] Hover effects work (scale, shadow)
- [ ] Loading skeleton displays while loading

#### Pagination
- [ ] Previous button enabled (except page 1)
- [ ] Next button enabled (except last page)
- [ ] Page number displays correctly
- [ ] Clicking pagination loads new products
- [ ] Buttons are disabled on ends

#### Recommendations Section
- [ ] "Recommended For You" section displays
- [ ] Shows 4 product cards
- [ ] Section hides if no recommendations
- [ ] Product cards are clickable

#### Error Handling
- [ ] Error disables search
- [ ] Error shows red alert box with icon
- [ ] Error message is user-friendly

### 📄 Product Detail Page Tests

#### Navigation
- [ ] Back button visible and clickable
- [ ] Back button navigates to home
- [ ] Clicking product from home opens detail page
- [ ] URL shows correct product ID

#### Product Information
- [ ] Product name displays prominently
- [ ] Category shows as badge
- [ ] Product description shows
- [ ] Price displays in large gradient text
- [ ] Price is properly formatted (₹)

#### Features Section
- [ ] Content-based recommendations feature listed
- [ ] Collaborative filtering feature listed
- [ ] Check marks (✓) visible for features

#### Order Functionality
- [ ] "Create Order" button is prominent
- [ ] Button is clickable and responsive
- [ ] Success message shows after order
- [ ] Message includes recommendation info
- [ ] Multiple orders can be created
- [ ] Error message shows on failure

#### Similar Products
- [ ] "Similar Products" section displays
- [ ] Shows relevant product recommendations
- [ ] Each product card is clickable
- [ ] Clicking opens that product's detail page

#### Loading States
- [ ] Skeleton screens show while loading
- [ ] Skeleton count matches expected cards
- [ ] Loading animation is smooth

#### Error States
- [ ] Missing product shows error message
- [ ] Error page has back button
- [ ] Error page is user-friendly

### 📱 Responsive Design Tests

#### Mobile (320px width)
- [ ] Navigation fits on small screens
- [ ] Product grid shows 1 column
- [ ] Text is readable at small size
- [ ] Buttons are touch-friendly (min 48px)
- [ ] No horizontal scroll
- [ ] Images scale appropriately

#### Tablet (768px width)
- [ ] Product grid shows 2 columns
- [ ] Layout adapts to width
- [ ] Navigation still visible
- [ ] Spacing adjusts properly

#### Desktop (1200px+ width)
- [ ] Product grid shows 4 columns
- [ ] Max page width is respected
- [ ] Full layout utilizes space
- [ ] Hover effects work perfectly

### 🎨 Visual Design Tests

#### Colors
- [ ] Blue accent color (#2563eb) used for:
  - Primary buttons
  - Gradients
  - Highlights
- [ ] Slate/dark text on light backgrounds
- [ ] Green for success states
- [ ] Red for error states
- [ ] Gray for secondary text

#### Typography
- [ ] Headings are bold and clear
- [ ] Body text is readable
- [ ] Line-height is comfortable
- [ ] Font sizes scale with viewport

#### Spacing
- [ ] Consistent padding in cards
- [ ] Proper gap between grid items
- [ ] Good margins around sections
- [ ] Mobile spacing is adjusted

#### Animations
- [ ] Smooth transitions on hover
- [ ] Loading skeleton animation smooth
- [ ] Button scale on click (active state)
- [ ] No jarring layout shifts

### 🔄 API Integration Tests

#### Product Loading
- [ ] Products load from correct endpoint
- [ ] Pagination params are sent correctly
- [ ] Search params are sent correctly
- [ ] Response data displays correctly
- [ ] Errors are handled gracefully

#### Recommendations
- [ ] Recommendations load for user ID 1
- [ ] Content-based items show (similar category/price)
- [ ] Collaborative items show (similar users)
- [ ] No recommendations show if API returns empty

#### View Tracking
- [ ] View event sent when product opened
- [ ] View includes userID and productID
- [ ] View tracking doesn't break UX

#### Order Creation
- [ ] Order sent with correct data
- [ ] Success response shows to user
- [ ] Error response shows to user
- [ ] Multiple orders can be created

### ⚡ Performance Tests

#### Load Time
- [ ] Home page loads < 2 seconds
- [ ] Product detail < 1 second
- [ ] Skeleton shows while loading

#### Search Performance
- [ ] Search results return quickly
- [ ] No lag while typing
- [ ] Pagination loads quickly

#### Image Performance
- [ ] Product images load properly
- [ ] Images fit card layout
- [ ] No broken image placeholders

### 🔐 Security Tests

#### Input Validation
- [ ] Search input accepts text
- [ ] Special characters handled
- [ ] HTML injection prevented

#### API Communication
- [ ] API calls use correct headers
- [ ] CORS errors handled
- [ ] Network errors show user message

### ♿ Accessibility Tests

#### Keyboard Navigation
- [ ] Tab key navigates elements
- [ ] Focus states visible
- [ ] Buttons keyboard accessible
- [ ] Enter triggers buttons

#### Screen Reader
- [ ] Alt text present (for images when added)
- [ ] Semantic HTML structure
- [ ] Form labels proper

#### Color Contrast
- [ ] Text passes WCAG AA standards
- [ ] Icon contrast sufficient
- [ ] Button text readable

## Automated Testing Scripts

### Test Product Grid Loading
```javascript
// Verify products load
const products = document.querySelectorAll('[class*="ProductCard"]');
console.log(`${products.length} products loaded`);
```

### Test Responsive Grid
```javascript
// Check grid columns at current width
const grid = document.querySelector('[class*="grid"]');
const style = window.getComputedStyle(grid);
console.log('Grid columns:', style.gridTemplateColumns);
```

### Test API Response
```javascript
// Verify API call
fetch('http://localhost:5000/products?limit=1')
  .then(r => r.json())
  .then(d => console.log('API working:', d))
  .catch(e => console.error('API failed:', e));
```

## Browser Testing Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | ✅ | Primary browser |
| Firefox | Latest | ✅ | Works fine |
| Safari | Latest | ✅ | Mobile Safari too |
| Edge | Latest | ✅ | Chromium-based |
| Mobile Chrome | Latest | ✅ | Touch optimized |
| Mobile Safari | Latest | ✅ | iOS support |

## Common Issues & Solutions

### Issue: Products Not Loading
**Cause**: Backend not running or API URL wrong  
**Solution**: 
```bash
# Check backend is running
curl http://localhost:5000/products?limit=1

# Verify .env.local
cat .env.local
```

### Issue: Styles Looking Wrong
**Cause**: Tailwind CSS not compiled  
**Solution**:
```bash
# Rebuild styles
rm -rf .next
npm run dev
```

### Issue: Images Broken
**Cause**: Backend image serving issue  
**Solution**: Check backend image paths in database

### Issue: Slow Performance
**Cause**: Network or backend issue  
**Solution**: Check network tab in DevTools

## Performance Benchmarks

### Expected Load Times
- **Home Page**: 800ms - 1.5s
- **Product Detail**: 600ms - 1.2s
- **Search**: 400ms - 800ms

### Expected Bundle Size
- **JS**: ~100KB (gzipped)
- **CSS**: ~30KB (gzipped)

## QA Sign-Off Checklist

Before deploying to production:

- [ ] All manual tests pass
- [ ] No console errors
- [ ] All API endpoints working
- [ ] Mobile responsive verified
- [ ] Performance acceptable
- [ ] No security issues
- [ ] Accessibility checked
- [ ] Cross-browser tested

## Test User Scenarios

### Scenario 1: New User Flow
1. User arrives at home page
2. Sees product recommendations
3. Clicks on a product
4. Views product details
5. Creates an order
6. Sees order confirmation
7. Returns to home

**Expected**: ✅ All steps work smoothly

### Scenario 2: Search User
1. User goes to home
2. Searches for "laptop"
3. Results update instantly
4. Pagination works
5. Clicks product from results

**Expected**: ✅ Search and pagination work

### Scenario 3: Mobile User
1. User accesses on phone
2. Navigation visible and clickable
3. Products show 1 per row
4. All buttons touch-friendly
5. No horizontal scroll

**Expected**: ✅ Mobile experience flawless

## Debugging Tips

### Use Browser DevTools
```javascript
// In console, test API
await fetch('/products?limit=1').then(r => r.json()).then(d => console.table(d.items));
```

### Check Network Tab
- Verify API calls
- Check response times
- Look for failed requests

### Use React DevTools
- Inspect component hierarchy
- Check state values
- Profile performance

### Check Application Tab
- Verify localStorage
- Check sessionStorage
- Clear cache if needed

---

**Testing is continuous. Run this checklist before each release!**

Last Updated: 2024-05-15  
Frontend Version: 1.0.0
