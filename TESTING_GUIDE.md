# Testing Guide - Verify Backend Fixes

## Quick Test (5 minutes)

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### 2. Test Workout Flow
1. Open `http://localhost:5174/`
2. Go to **Workouts** tab → Select a template → Click "Start Workout"
3. Complete 2-3 sets with weight and reps (e.g., 100kg x 10 reps)
4. Click **"Finish Workout"** button
5. Check browser console - should see "All logs saved successfully" and "Session created"

### 3. Verify in History
1. Go to **History** tab
2. Your workout should appear with:
   - ✅ Correct total volume (not 0)
   - ✅ Exercise names visible (not "Unknown Exercise")
   - ✅ Correct set data when you click the session

### 4. Check Database (Optional)
```bash
node test-api.js
```
Should show your new session with proper volume.

## What Should Work Now

✅ **Saving Workouts**: All sets save to database when you click "Finish Workout"  
✅ **Accurate Volume**: Total volume calculated from actual completed sets  
✅ **Exercise Names**: Full names display in history (no more "Unknown Exercise")  
✅ **Clean Data**: No empty strings, proper NULL handling  

## If You See Issues

### "Exercises page is empty"
- **Wait 2 seconds** after server starts (exercises seed automatically)
- Hard refresh browser: `Ctrl + F5` (clears cache)
- Check you're at `http://localhost:5174/` not `3001`

### "History shows 0 volume"
- Old sessions (before fix) will still show 0
- **New workouts** will have correct volume
- To fix old ones, we can run migration script

### "Exercise names missing"
- Should be fixed now with the JOIN update
- If still missing, check browser console for errors

## Need Help?

Run diagnostics:
```bash
node test-api.js
```

This tests all API endpoints and shows if everything is working.
