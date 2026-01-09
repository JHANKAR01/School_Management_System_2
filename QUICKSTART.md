# Project Sovereign - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Environment Setup
Your `.env` file is already configured with:
- Supabase URL
- Supabase Anonymous Key

### Step 3: Run Development Server
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### Step 4: Login
Use the demo credentials:
- **Phone:** 9999999999
- **Password:** demo123

## 📱 User Roles & Dashboards

### Super Admin
**Access:** Global platform management
**URL:** `/` (auto-routed based on role)
**Features:**
- Create and manage schools
- View global metrics
- Monitor subscription status

**Demo Steps:**
1. Login with demo credentials (Super Admin)
2. Click "Create School" button
3. Enter school name and slug
4. See it appear in the schools list

### School Admin
**Access:** Single school management
**Features:**
- Manage students and staff
- Configure fee structure
- Generate invoices
- Create exams and mark results
- View financial reports

**To Test:**
1. Create a school as Super Admin
2. Switch to school admin account (will need to create)
3. Explore the Students, Fees, and Exams tabs

### Teacher
**Access:** Class-level operations
**Features:**
- Mark attendance
- Enter marks
- View class timetable
- Submit assignments

### Parent/Student
**Access:** Personal portal
**Features:**
- View pending fees
- Make UPI payments
- View attendance
- Download report cards

## 💡 Key Features to Try

### 1. Fee Payment System
1. Go to School Admin → Fees tab
2. Click "Generate Invoices"
3. Select students and due date
4. View the invoice QR code
5. Click "Pay Fees" to see UPI integration

### 2. Attendance Marking
1. Navigate to Attendance component
2. Toggle students between present/absent
3. Click "Submit Attendance"
4. See data saved to database

### 3. Exam Management
1. Go to Fees tab → Exam section
2. Create a new exam
3. Enter marks for students
4. System auto-calculates grades
5. Publish results

### 4. Student Management
1. Students tab → "Add Student"
2. Fill in student details
3. Parent contact info auto-creates parent account
4. View in student list

## 📊 Database Operations

### View Live Data
The app automatically fetches from Supabase:
- **Students:** Shows all active students in school
- **Invoices:** Real-time fee bill tracking
- **Attendance:** Daily attendance records
- **Exams:** Exam schedule and results

### Add Test Data
```sql
-- Login to Supabase dashboard
-- Add a school
INSERT INTO schools (name, slug, is_active)
VALUES ('Test School', 'test-school', true);

-- Add a user
INSERT INTO users (school_id, phone, first_name, role, is_active)
VALUES ('<school_id>', '9876543210', 'Admin Name', 'school_admin', true);
```

## 🔐 Security Features

- **Row-Level Security:** Data automatically filtered by school
- **Role-based Access:** Users can only access their school's data
- **Authentication:** Phone-based with secure passwords
- **Data Isolation:** Multi-tenant architecture

## 📱 Responsive Design

The UI is fully responsive:
- **Desktop:** 4-column layouts, dense tables
- **Tablet:** 2-column layouts
- **Mobile:** Single column, thumb-friendly buttons

## 🛠️ Common Tasks

### Create a New School
```
Super Admin → Create School → Fill form → Submit
```

### Add Students to Class
```
School Admin → Students → Add Student → Fill details → Submit
```

### Generate Fee Invoices
```
School Admin → Fees → Generate Invoices → Select students → Submit
```

### Mark Attendance
```
Teacher → Dashboard → Mark Attendance → Toggle students → Submit
```

### Create Exam & Marks
```
School Admin → Fees → Create Exam → Add marks → Publish
```

## 🐛 Debugging

### Check Database
1. Go to Supabase Dashboard
2. Navigate to the SQL Editor
3. Query specific tables:
```sql
SELECT * FROM schools;
SELECT * FROM users WHERE school_id = '<id>';
SELECT * FROM invoices LIMIT 10;
```

### Enable React Query DevTools (Optional)
Add to App.tsx:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In App component return:
<ReactQueryDevtools initialIsOpen={false} />
```

### Check Network Calls
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "fetch"
4. See all Supabase API calls

## 📈 Performance Tips

1. **Caching:** React Query automatically caches data
2. **Pagination:** Large lists use pagination to reduce data
3. **Indexes:** Database has indexes on frequently queried columns
4. **Lazy Loading:** Components load data on-demand

## 🔗 Important Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vite Docs:** https://vitejs.dev
- **React Query Docs:** https://tanstack.com/query
- **Tailwind CSS:** https://tailwindcss.com

## 🚨 Common Issues & Solutions

### Issue: "Cannot read property 'school_id' of null"
**Cause:** User not logged in or profile not loaded
**Fix:** Wait for auth context to load, check browser console

### Issue: "RLS policy violation"
**Cause:** User querying data outside their school
**Fix:** Check that school_id filter is applied to queries

### Issue: "Module not found: qrcode.react"
**Cause:** Dependencies not installed correctly
**Fix:** `npm install --legacy-peer-deps`

### Issue: Build errors
**Cause:** TypeScript errors
**Fix:** `npm run typecheck` to see all errors, fix them

## 📝 Next Steps

After exploring the demo:

1. **Customize:** Modify colors/logo in components
2. **Add Data:** Create more students, fees, exams
3. **Test Flows:** Go through complete workflows
4. **Deploy:** Follow deployment guide in README
5. **Extend:** Add more features as needed

## 💬 Support

For detailed documentation, see `IMPLEMENTATION.md`

For issues:
1. Check the database schema
2. Verify RLS policies
3. Check browser console for errors
4. Review component code comments

---

**Happy Building! 🎓**

Questions? Check the implementation guide or examine the source code - it's well-commented!
