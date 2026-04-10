# 👨‍💻 Developer Quick Reference Card

## 🚀 One-Minute Setup
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## 📍 Key File Locations

```
Home Page          → app/page.js
Product Detail     → app/products/[id]/page.js
Global Styles      → app/globals.css
API Service        → lib/api.js
Navbar             → components/Navbar.js
```

## 🔧 Important Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production build
```

## 🎯 Component Props

### ProductCard
```javascript
<ProductCard 
  product={{id, name, price, category, source}}
  caption="Optional description"
/>
```

### RecommendationSection
```javascript
<RecommendationSection
  title="Section Title"
  subtitle="Description"
  products={product[]}
/>
```

### LoadingGrid
```javascript
<LoadingGrid count={8} />  // Default: 8
```

## 📡 API Functions

```javascript
import { 
  fetchProducts,           // List products
  fetchProductById,        // Get one product
  fetchRecommendations,    // Get recommendations
  createView,              // Track product view
  createOrder              // Create order
} from '@/lib/api'
```

## 🎨 Design Tokens

### Colors
```
Primary:   #2563eb (Blue)
Secondary: #0f172a (Slate)
Success:   #16a34a (Green)
Error:     #dc2626 (Red)
```

### Spacing
```
Card: 20px padding
Gap:  20px between items
Max:  1200px width
```

## 📱 Responsive Breakpoints

```
Mobile     < 640px
Tablet     640px - 1024px
Desktop    > 1024px
Grid:      1 → 2 → 4 cols
```

## 🔄 State Pattern

```javascript
const [loading, setLoading] = useState(true)
const [error, setError] = useState("")
const [data, setData] = useState(null)

useEffect(() => {
  async function load() {
    try {
      setLoading(true)
      const res = await api()
      setData(res)
    } catch(err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [dependencies])
```

## 🌐 Environment Variable

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📚 Documentation

| Guide | Use For |
|-------|---------|
| QUICK_START.md | Getting started |
| FRONTEND_README.md | All features |
| ARCHITECTURE.md | System design |
| TESTING_GUIDE.md | Testing |

## 🐛 Debugging

### Check API
```bash
curl http://localhost:5000/products?limit=1
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

### Use DevTools
- F12 for browser DevTools
- Check Network tab
- Check Console for errors

## ✅ Pre-Deployment Checklist

- [ ] Backend running on port 5000
- [ ] All products load
- [ ] Search works
- [ ] Pagination works
- [ ] Order creation works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All links work

## 🚨 Common Issues

| Issue | Fix |
|-------|-----|
| Can't connect to backend | Check port 5000 is running |
| Styles broken | Delete `.next` and rebuild |
| Port 3000 in use | Use `npm run dev -- -p 3001` |
| Images not showing | Check backend image paths |

## 📞 Quick Help

**API not responding?**
→ Check backend is running

**Styling issues?**
→ `rm -rf .next && npm run dev`

**Build failing?**
→ Check npm dependencies are installed

## 🎯 File Structure at a Glance

```
frontend/
├── app/              Pages
├── components/       Reusable UI
├── lib/              API service
├── globals.css       Styles
└── package.json      Config
```

## ⏱️ Performance Targets

- Home page: < 1.5s
- Search: < 800ms
- Detail page: < 1.2s
- JS: ~100KB gzipped
- CSS: ~30KB gzipped

## 🔐 Environment Setup

```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000

# Start backend (separate terminal)
cd ../backend
npm run dev

# Start frontend
npm run dev
```

## 💡 Pro Tips

1. Use React DevTools browser extension
2. Monitor Network tab for API calls
3. Check Console for error messages
4. Hot reload works - save and refresh
5. Use mobile device for responsive testing

## 🎨 Styling Quick Tips

- Tailwind classes work everywhere
- Custom styles in globals.css
- Use pt-, pb-, px-, py- for spacing
- Use hover:, focus: for interactions
- Use sm:, md:, lg: for responsive

## 📱 Mobile Testing

```bash
# Run on phone/tablet on same network
npm run dev -- --host
# Then visit: http://[YOUR_IP]:3000
```

## 🔗 Useful Links

- Next.js Docs: nextjs.org/docs
- React Docs: react.dev
- Tailwind Docs: tailwindcss.com/docs
- API: localhost:5000

---

**Print this card and keep it handy! 📋**

Version: 1.0.0 | Updated: 2024
