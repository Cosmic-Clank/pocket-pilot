# React Query Implementation - Testing Guide

## Overview
Your frontend has been optimized with TanStack React Query to eliminate constant data refetching on every page focus. All screens and components now use intelligent caching with automatic invalidation.

## ✅ What Was Implemented

### 1. QueryClient Setup
- **Location**: `app/_layout.tsx`
- **Default Cache Times**:
  - `staleTime`: 5 minutes (queries fetch fresh data after this)
  - `cacheTime`: 10 minutes (data stays in memory)
  - `retry`: 2 attempts on failure
  - `refetchOnWindowFocus`: true (smart refresh when app regains focus)

### 2. Query Hooks Created (7 hooks)
All located in `hooks/queries/`:
- ✅ `use-transactions.ts` - 3min staleTime
- ✅ `use-budgets.ts` - 5min staleTime
- ✅ `use-profile.ts` - 1hr staleTime (rarely changes)
- ✅ `use-watchlist.ts` - 5min staleTime
- ✅ `use-stock-trades.ts` - 5min staleTime
- ✅ `use-top-picks.ts` - **30min staleTime** (HEAVY ENDPOINT - optimized!)
- ✅ `use-ai-notifications.ts` - 30min-1hr staleTime

### 3. Mutation Hooks Created (5 hooks)
All located in `hooks/mutations/`:
- ✅ `use-transaction-mutations.ts` - Auto-invalidates transactions
- ✅ `use-budget-mutations.ts` - Auto-invalidates budgets
- ✅ `use-profile-mutations.ts` - Auto-invalidates profile
- ✅ `use-stock-trade-mutations.ts` - Auto-invalidates trades + transactions
- ✅ `use-watchlist-mutations.ts` - Auto-invalidates watchlist

### 4. Converted Screens (All tab screens)
- ✅ `app/(tabs)/index.tsx` (Home) - Removed 50+ lines of manual fetching
- ✅ `app/(tabs)/transactions.tsx` - Removed useFocusEffect
- ✅ `app/(tabs)/savings.tsx` - Removed loadData callback
- ✅ `app/(tabs)/profile.tsx` - Removed manual state management
- ✅ `app/(tabs)/ai-record.tsx` - Already using hooks
- ✅ `app/weekly-report.tsx` - Converted to use cached data

### 5. Converted Components (10+ components)
- ✅ `components/ai-record/top-picks.tsx` - **CRITICAL: Heavy endpoint now cached 30min!**
- ✅ `components/ai-record/portfolio-section.tsx`
- ✅ `components/ai-record/watchlist-section.tsx`
- ✅ `components/ai-record/available-to-invest-card.tsx`
- ✅ `components/home/financial-overview-card.tsx`
- ✅ `components/home/salary-day-card.tsx`
- ✅ `components/savings/current-savings-card.tsx`
- ✅ `components/savings/monthly-budgets.tsx`
- ✅ `components/profile/edit-profile-bottom-sheet.tsx`
- ✅ `components/profile/settings-bottom-sheet.tsx`
- ✅ `components/emergency-fund/emergency-fund-transaction-bottom-sheet.tsx`

---

## 🧪 Testing Checklist

### **PRIORITY 1: Test Heavy Endpoints (Your Main Pain Point)**

#### Top Picks Section (ai-record tab)
```
✅ The Problem: "top pics endpoint, because it is heavy...very slow...having to data fetch on every focuz is bad"
✅ The Fix: 30-minute cache with React Query

Test Steps:
1. Navigate to AI Record tab
2. Observe top picks loading (first time - should fetch from API)
3. Switch to another tab (Home, Transactions, etc.)
4. Switch back to AI Record tab
5. ✅ VERIFY: Top picks appear INSTANTLY (no loading, no API call)
6. Repeat step 3-4 multiple times
7. ✅ VERIFY: No refetching for 30 minutes unless you:
   - Execute a trade (invalidates data)
   - Add a transaction (invalidates data)
   - Add a budget (invalidates data)
```

#### AI Recommendations (Home Screen)
```
Test Steps:
1. Navigate to Home screen
2. Observe "AI Savings Tip" and "AI Investment Idea" loading
3. Switch tabs and return
4. ✅ VERIFY: AI cards show instantly (cached for 30min-1hr)
```

---

### **PRIORITY 2: Test Tab Navigation (No More Refetching!)**

#### Home Screen
```
Test Steps:
1. Open app → Home screen loads data
2. Navigate away to Transactions tab
3. Return to Home screen
4. ✅ VERIFY: 
   - Financial overview shows instantly (no loading spinner)
   - Insights section appears immediately
   - Salary day card (if visible) appears instantly
   - NO useFocusEffect refetching!
```

#### Transactions Screen
```
Test Steps:
1. Navigate to Transactions tab (loads data)
2. Switch to Home tab
3. Return to Transactions tab
4. ✅ VERIFY: Transaction list appears INSTANTLY
5. Add a new transaction using the + button
6. ✅ VERIFY: Transaction list auto-updates (mutation invalidation works!)
```

#### Savings Screen
```
Test Steps:
1. Navigate to Savings tab
2. Switch tabs and return
3. ✅ VERIFY: Monthly budgets, current savings card show instantly
4. Add a new budget
5. ✅ VERIFY: Budget list auto-updates without manual refresh
```

#### Profile Screen
```
Test Steps:
1. Navigate to Profile tab
2. Switch tabs and return
3. ✅ VERIFY: Profile data appears instantly
4. Edit profile (change name, monthly income, etc.)
5. ✅ VERIFY: Profile updates automatically everywhere it's displayed
```

---

### **PRIORITY 3: Test Automatic Invalidation (Mutations)**

#### Add Transaction → Auto-Refresh
```
Test Steps:
1. Note current balance on Home screen
2. Go to Transactions tab
3. Add a new transaction
4. ✅ VERIFY: Transaction list updates automatically
5. Go back to Home screen
6. ✅ VERIFY: Financial overview reflects new transaction (no manual refresh!)
```

#### Add Budget → Auto-Refresh
```
Test Steps:
1. Go to Savings tab
2. Add new budget (e.g., "Groceries" - 500 AED)
3. ✅ VERIFY: Budget list updates automatically
4. Go to Home screen
5. ✅ VERIFY: Budget-related cards reflect new budget
```

#### Execute Trade → Auto-Refresh
```
Test Steps:
1. Go to AI Record tab
2. Execute a trade from Top Picks
3. ✅ VERIFY: 
   - Top Picks updates (removes executed trade)
   - Portfolio section updates
   - Available to Invest card updates
4. Go to Transactions tab
5. ✅ VERIFY: Trade transaction appears in list
```

#### Update Profile → Auto-Refresh
```
Test Steps:
1. Go to Profile tab
2. Edit profile (change monthly income)
3. ✅ VERIFY: Profile screen updates
4. Go to Home screen
5. ✅ VERIFY: Salary day card reflects new income
6. Go to Savings tab
7. ✅ VERIFY: Savings calculations update
```

---

### **PRIORITY 4: Test Cache Staleness (Data Freshness)**

#### Short Cache (3 minutes - Transactions)
```
Test Steps:
1. Navigate to Transactions tab (fetches data)
2. Wait 4 minutes
3. Switch to another tab and back to Transactions
4. ✅ VERIFY: Data refetches automatically (stale time exceeded)
```

#### Long Cache (1 hour - Profile)
```
Test Steps:
1. Navigate to Profile tab (fetches data)
2. Switch tabs multiple times over 10-15 minutes
3. ✅ VERIFY: Profile data NEVER refetches (unless explicitly edited)
```

---

### **PRIORITY 5: Test Background Refresh**

#### App Focus Behavior
```
Test Steps:
1. Open app and navigate to Home screen
2. Press home button (or switch apps)
3. Leave app in background for 6+ minutes
4. Reopen app
5. ✅ VERIFY: Data automatically refetches (stale + refetchOnWindowFocus kicks in)
```

---

## 🐛 Known Issues to Watch For

### Issue: "Data not updating after mutation"
**Symptom**: You add a transaction but the list doesn't update  
**Diagnosis**: Check if mutation hook has `onSuccess` with `invalidateQueries`  
**Fix**: Verify `TRANSACTIONS_QUERY_KEY` matches between query and mutation

### Issue: "Loading spinner appears every time"
**Symptom**: Screen shows loading state on every visit  
**Diagnosis**: Query might not be caching properly  
**Fix**: Check if `staleTime` is set in the query hook

### Issue: "Data is outdated"
**Symptom**: Screen shows old data even after changes  
**Diagnosis**: Cache not invalidating on mutation  
**Fix**: Check mutation's `invalidateQueries` call

### Issue: "Multiple API calls on mount"
**Symptom**: Network tab shows duplicate requests  
**Diagnosis**: Multiple components using same query  
**Fix**: This is actually GOOD - React Query deduplicates automatically

---

## 📊 Performance Metrics to Observe

### Before React Query (What you had):
- ❌ Every screen refetched data on **every focus**
- ❌ Top Picks endpoint fetched **10+ times per session**
- ❌ Multiple components fetched same data independently
- ❌ Manual state management in 20+ files

### After React Query (What you have now):
- ✅ Screens load instantly from cache (no loading states)
- ✅ Top Picks fetches **once per 30 minutes**
- ✅ Single source of truth - all components share cached data
- ✅ Automatic cache invalidation - no manual refreshes

---

## 🔍 Debugging Commands

### Check what's in the cache:
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
console.log('Cache state:', queryClient.getQueryCache().getAll());
```

### Manually invalidate cache:
```typescript
await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
```

### Manually refetch:
```typescript
const { refetch } = useTransactions();
await refetch();
```

---

## 📝 Quick Reference: Cache Times

| Data Type | Stale Time | Why? |
|-----------|-----------|------|
| Transactions | 3 min | Changes frequently |
| Budgets | 5 min | Moderate changes |
| Profile | 1 hour | Rarely changes |
| Stock Trades | 5 min | Moderate updates |
| Watchlist | 5 min | User adds/removes often |
| **Top Picks** | **30 min** | **Heavy endpoint, AI-generated, changes slowly** |
| AI Tips | 30 min | Generated periodically |
| AI Ideas | 1 hour | Long-term recommendations |

---

## ✨ What YOU Should Notice

1. **Instant Navigation**: Switching tabs is now FAST - no more waiting for data
2. **No More Spinners**: Data appears instantly when already cached
3. **Smart Refresh**: Data only refetches when truly stale
4. **Auto Updates**: Add transaction → all screens update automatically
5. **Top Picks Relief**: The heavy endpoint now only fetches once per 30 minutes!

---

## 🎯 Next Steps

### If Everything Works:
1. Remove old service calls from any remaining files
2. Monitor performance in production
3. Adjust cache times based on user behavior
4. Consider adding React Query DevTools for development

### If You See Issues:
1. Check browser/app console for errors
2. Verify query keys match between queries and mutations
3. Test network requests in DevTools
4. Review cache invalidation logic in mutations

---

## 🚀 Success Criteria

Your implementation is successful when:
- ✅ Switching tabs feels instant (no loading states)
- ✅ Top Picks section loads quickly after first fetch
- ✅ Adding transactions updates all relevant screens
- ✅ No more "every focus" refetching behavior
- ✅ Data stays fresh without manual refreshes

**YOU ARE DONE IMPLEMENTING!** Now test thoroughly and enjoy your optimized app! 🎉
