# LeadSathi - Complete Setup Guide
## Lead Capture Form + Analytics Dashboard

### 📋 What You Get
**Lead Capture Form:**
- Professional mobile-friendly form
- Real-time validation
- Automatic Google Sheets integration
- IST (Indian Standard Time) timestamps

**Analytics Dashboard:**
- Real-time lead statistics
- Interactive charts (sources, business types, trends)
- Auto-refresh every 30 seconds
- Recent leads table
- Growth indicators

---

## 🚀 Complete Setup Process

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "LeadSathi Leads"
4. Keep this tab open

---

### Step 2: Deploy Enhanced Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. **Copy the ENTIRE code from `leadsathi-apps-script-enhanced.js`**
4. Paste it into the Apps Script editor
5. Optional: Change `SHEET_NAME` if needed:
   ```javascript
   const SHEET_NAME = 'Leads'; // Your custom sheet name
   ```
6. Click **Save** (💾) and name it "LeadSathi Enhanced API"

---

### Step 3: Test the Enhanced Script

This is important to verify everything works!

**Test 1: Form Submission**
1. Select `testSetup` from the function dropdown
2. Click **Run** (▶️)
3. Grant permissions when prompted:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" > "Go to LeadSathi Enhanced API (unsafe)"
   - Click "Allow"
4. Check your Google Sheet - you should see a test lead

**Test 2: Analytics Endpoints**
1. Select `testAnalytics` from the function dropdown
2. Click **Run** (▶️)
3. Click "Execution log" at bottom to see all analytics data
4. You should see Overview, Sources, Business Types, Trend, Recent Leads, and Stats

✅ If both tests pass, you're ready to deploy!

---

### Step 4: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description:** LeadSathi Enhanced API v1
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. **COPY THE WEB APP URL** (looks like):
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
7. Keep this URL - you'll need it for both form and dashboard!

---

### Step 5: Configure the Form

The form is already configured with your URL, but verify:

1. Open `leadsathi-connected.html`
2. Check this line (around line 498):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/.../exec';
   ```
3. Make sure it matches your Web App URL

---

### Step 6: Configure the Dashboard

1. Open `leadsathi-dashboard.html` in a text editor
2. Find this line (around line 700):
   ```javascript
   const API_URL = 'https://script.google.com/.../exec';
   ```
3. Replace with YOUR Web App URL (same URL as the form)
4. Save the file

---

### Step 7: Test Everything

**Test the Form:**
1. Open `leadsathi-connected.html` in browser
2. Fill in test data
3. Submit
4. Check Google Sheet for the new lead

**Test the Dashboard:**
1. Open `leadsathi-dashboard.html` in browser
2. You should see:
   - Total leads count
   - Source distribution chart
   - Business type chart
   - 30-day trend chart
   - Recent leads table
3. Click "Refresh" to reload data

---

## 📊 Dashboard Features Explained

### Key Metrics Cards
- **Total Leads:** All-time count
- **Today:** Leads captured today (with growth % vs yesterday)
- **This Week:** Leads this week (with growth % vs last week)
- **This Month:** Leads in last 30 days

### Lead Sources Chart (Donut)
- Visual breakdown of where leads come from
- Click on segments for details
- Shows percentages

### Business Types Chart (Bar)
- Distribution across industries
- Helps identify target audience
- Shows count and percentage

### Lead Trend (Line Chart)
- Daily lead capture over 30 days
- Identify patterns and peak days
- Smooth curve for better visualization

### Recent Leads Table
- Last 10 leads captured
- Sortable and filterable
- Color-coded source badges

---

## 🎯 API Endpoints

Your enhanced script provides these endpoints:

```
Base URL: YOUR_WEB_APP_URL

GET ?action=overview
→ Returns: total, today, week, month counts

GET ?action=sources
→ Returns: Lead source distribution with counts & percentages

GET ?action=businessTypes
→ Returns: Business type distribution with counts & percentages

GET ?action=trend&days=30
→ Returns: Daily lead count for last N days

GET ?action=recent&limit=10
→ Returns: Last N leads with all details

GET ?action=stats
→ Returns: Detailed statistics with growth rates

POST (JSON body)
→ Captures new lead (same as before)
```

---

## 🎨 Customization Options

### Change Dashboard Colors

In `leadsathi-dashboard.html`, find the `:root` section:
```css
:root {
    --primary: #0891b2;        /* Main cyan color */
    --primary-dark: #0e7490;   /* Darker shade */
    --primary-light: #06b6d4;  /* Lighter shade */
}
```

### Change Auto-Refresh Interval

In `leadsathi-dashboard.html`, find:
```javascript
setInterval(refreshData, 30000); // 30 seconds
```
Change `30000` to your preferred milliseconds (60000 = 1 minute)

### Show More Recent Leads

In `leadsathi-dashboard.html`, change:
```javascript
fetchData('recent', '&limit=10') // Change 10 to 20, 50, etc.
```

### Change Trend Duration

In `leadsathi-dashboard.html`, change:
```javascript
fetchData('trend', '&days=30') // Change 30 to 7, 60, 90, etc.
```

---

## 📱 Deployment Options

### Option 1: Host on Your Server
Upload both HTML files to your web hosting:
- `leadsathi-connected.html` → yoursite.com/capture-lead
- `leadsathi-dashboard.html` → yoursite.com/dashboard

### Option 2: Google Drive (Quick & Free)
1. Upload both files to Google Drive
2. Right-click each → Get link → "Anyone with the link"
3. Share links with your team

### Option 3: GitHub Pages (Recommended)
1. Create GitHub repository "leadsathi"
2. Upload files:
   - Rename `leadsathi-connected.html` to `index.html`
   - Keep `leadsathi-dashboard.html` as is
3. Enable GitHub Pages in Settings
4. Access via:
   - Form: username.github.io/leadsathi
   - Dashboard: username.github.io/leadsathi/leadsathi-dashboard.html

### Option 4: Deploy Both with URL Structure
```
/capture       → Lead capture form
/dashboard     → Analytics dashboard
```

---

## 🔧 Troubleshooting

### Dashboard shows "Loading..." forever

**Possible causes:**
1. API_URL not configured correctly
2. Apps Script not deployed as Web App
3. Network/firewall blocking requests

**Solution:**
- Open browser console (F12)
- Check for error messages
- Verify API_URL matches your Web App URL exactly
- Test API directly: paste `YOUR_URL?action=overview` in browser

### Charts not displaying

**Possible causes:**
1. No data in sheet yet
2. Chart.js not loading

**Solution:**
- Add test leads first using the form
- Check internet connection (Chart.js loads from CDN)
- Open console to check for JavaScript errors

### Data not matching between form and dashboard

**Solution:**
- Click refresh on dashboard
- Check if you're using the same Google Sheet
- Verify both form and dashboard use the same API_URL

### "Script execution failed" errors

**Solution:**
- Check Apps Script execution logs (View > Logs)
- Ensure all permissions are granted
- Re-run `testAnalytics` to verify setup

---

## 📈 Using the Dashboard

### Daily Monitoring
1. Open dashboard in the morning
2. Check "Today" count
3. Monitor which sources are most active
4. Review recent leads

### Weekly Analysis
1. Check "This Week" card for growth trends
2. Compare with last week's percentage
3. Identify most effective lead sources
4. Adjust marketing strategy accordingly

### Monthly Review
1. Export data from Google Sheet
2. Analyze 30-day trend chart
3. Calculate conversion rates
4. Plan next month's targets

---

## 🔐 Security Best Practices

1. **Limit Script URL Sharing**
   - Only share with trusted team members
   - Anyone with URL can submit leads

2. **Monitor Your Sheet**
   - Regularly check for suspicious entries
   - Set up email notifications (optional feature)

3. **Backup Your Data**
   - File > Download > CSV (weekly backup)
   - Keep backups in Google Drive

4. **Set Up Data Validation**
   - In Google Sheets, use Data > Data validation
   - Prevent accidental data corruption

---

## 🎓 Advanced Tips

### Email Notifications
Uncomment the email notification function in the enhanced script:
```javascript
// Find this in the script:
/*
function sendLeadNotification(leadData) {
```
Remove `/*` and `*/`, then add:
```javascript
sendLeadNotification(data); // In doPost function
```

### Custom Analytics
Add your own analytics functions:
```javascript
function getConversionRate() {
  // Your custom logic
}
```

### Dashboard Widgets
Add custom metrics cards by copying the stat-card HTML structure.

### Export Dashboard Data
Add export buttons for CSV/PDF downloads using browser print.

---

## 📞 Support & Help

### Getting Help
1. Check browser console (F12) for errors
2. Review Apps Script logs (View > Logs)
3. Test individual API endpoints in browser
4. Check Google Sheet for data consistency

### Common Error Messages

**"No data received"**
→ Form not sending data correctly, check network tab

**"Invalid mobile number"**
→ Backend validation failing, must start with 6-9

**"Sheet not found"**
→ SHEET_NAME in script doesn't match actual sheet

---

## ✨ What's Next?

### Immediate Actions
1. ✅ Deploy the enhanced script
2. ✅ Test both form and dashboard
3. ✅ Share form URL with team
4. ✅ Bookmark dashboard for daily monitoring

### Future Enhancements
- Connect to CRM (SalesSphere integration)
- WhatsApp notifications for new leads
- Lead scoring system
- Automated follow-up reminders
- Team performance tracking

---

## 📁 File Summary

```
LeadSathi Complete Package/
├── leadsathi-connected.html              (Lead Capture Form)
├── leadsathi-dashboard.html              (Analytics Dashboard)
├── leadsathi-apps-script-enhanced.js     (Backend API)
└── SETUP-GUIDE.md                        (This file)
```

---

## 🎉 Quick Start Checklist

- [ ] Google Sheet created
- [ ] Enhanced script deployed
- [ ] Web App URL copied
- [ ] Form configured with URL
- [ ] Dashboard configured with URL
- [ ] Test lead submitted successfully
- [ ] Dashboard showing data correctly
- [ ] Auto-refresh working
- [ ] Team members have access
- [ ] Bookmarks created

---

## 💡 Pro Tips

1. **Bookmark Dashboard:** Add to browser favorites for quick access
2. **Mobile Access:** Both form and dashboard work on mobile
3. **Multiple Tabs:** Keep dashboard open in one tab while working
4. **Regular Backups:** Download CSV weekly for safety
5. **Monitor Trends:** Use 30-day chart to spot patterns
6. **Source Optimization:** Focus on high-performing sources
7. **Data Quality:** Regularly check for duplicate entries

---

**Built with ❤️ for CEOITBOX**
LeadSathi - Your complete lead management solution

**Version:** 2.0 (with Analytics Dashboard)
**Last Updated:** December 2024
