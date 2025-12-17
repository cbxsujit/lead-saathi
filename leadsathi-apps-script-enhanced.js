/**
 * LeadSathi Google Apps Script - Enhanced with Analytics
 * Handles form submissions and provides analytics endpoints for dashboard
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace existing code with this
 * 4. Save and Deploy as Web App
 * 5. Use the same Web App URL for both form and dashboard
 */

// Configuration
const SHEET_NAME = 'Leads';
const IST_OFFSET = 5.5;

/**
 * Handle POST requests (Form Submission)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    const validation = validateData(data);
    if (!validation.isValid) {
      return createResponse(false, validation.error);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      initializeSheet(sheet);
    } else {
      // Check if headers exist, if not add them
      const lastRow = sheet.getLastRow();
      if (lastRow === 0) {
        initializeSheet(sheet);
      }
    }
    
    const timestamp = getISTTimestamp();
    
    const rowData = [
      timestamp,
      data.name || '',
      data.mobile || '',
      data.businessType || '',
      data.leadSource || '',
      data.notes || ''
    ];
    
    sheet.appendRow(rowData);
    
    Logger.log('Lead captured successfully: ' + data.name);
    
    return createResponse(true, 'Lead captured successfully', {
      timestamp: timestamp,
      leadId: new Date().getTime()
    });
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse(false, 'Server error: ' + error.toString());
  }
}

/**
 * Handle GET requests (Dashboard Analytics)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (!action) {
      return createResponse(true, 'LeadSathi API is active', {
        endpoints: [
          'overview',
          'sources',
          'businessTypes',
          'trend',
          'recent',
          'stats'
        ]
      });
    }
    
    switch (action) {
      case 'overview':
        return createResponse(true, 'Overview data', getOverviewData());
      case 'sources':
        return createResponse(true, 'Lead sources data', getLeadsBySource());
      case 'businessTypes':
        return createResponse(true, 'Business types data', getLeadsByBusinessType());
      case 'trend':
        const days = parseInt(e.parameter.days) || 30;
        return createResponse(true, 'Trend data', getLeadsTrend(days));
      case 'recent':
        const limit = parseInt(e.parameter.limit) || 10;
        return createResponse(true, 'Recent leads', getRecentLeads(limit));
      case 'stats':
        return createResponse(true, 'Statistics', getDetailedStats());
      default:
        return createResponse(false, 'Invalid action parameter');
    }
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createResponse(false, 'Server error: ' + error.toString());
  }
}

/**
 * Initialize sheet with headers
 */
function initializeSheet(sheet) {
  const headers = [
    'Timestamp',
    'Name',
    'Mobile',
    'Business Type',
    'Lead Source',
    'Notes'
  ];
  
  sheet.appendRow(headers);
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0891b2');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 130);
  sheet.setColumnWidth(6, 250);
  
  sheet.setFrozenRows(1);
  
  Logger.log('Sheet initialized with headers');
}

/**
 * Get overview statistics
 */
function getOverviewData() {
  const sheet = getSheet();
  if (!sheet) return getEmptyOverview();
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return getEmptyOverview();
  
  const totalLeads = lastRow - 1;
  const dataRange = sheet.getRange(2, 1, totalLeads, 6);
  const data = dataRange.getValues();
  
  const now = new Date();
  const todayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  
  // Calculate week start (Monday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekStartStr = Utilities.formatDate(weekStart, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  
  // Calculate month start
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = Utilities.formatDate(monthStart, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  
  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;
  
  data.forEach(row => {
    const timestamp = row[0] ? row[0].toString() : '';
    const dateStr = timestamp.split(' ')[0];
    
    if (dateStr === todayStr) {
      todayCount++;
    }
    if (isDateAfterOrEqual(dateStr, weekStartStr)) {
      weekCount++;
    }
    if (isDateAfterOrEqual(dateStr, monthStartStr)) {
      monthCount++;
    }
  });
  
  return {
    total: totalLeads,
    today: todayCount,
    week: weekCount,
    month: monthCount,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get leads grouped by source
 */
function getLeadsBySource() {
  const sheet = getSheet();
  if (!sheet) return { sources: [] };
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { sources: [] };
  
  const dataRange = sheet.getRange(2, 5, lastRow - 1, 1);
  const sources = dataRange.getValues().flat();
  
  const sourceCounts = {};
  sources.forEach(source => {
    if (source) {
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    }
  });
  
  const sourceArray = Object.keys(sourceCounts).map(key => ({
    name: key,
    count: sourceCounts[key],
    percentage: ((sourceCounts[key] / sources.length) * 100).toFixed(1)
  }));
  
  sourceArray.sort((a, b) => b.count - a.count);
  
  return {
    sources: sourceArray,
    total: sources.length
  };
}

/**
 * Get leads grouped by business type
 */
function getLeadsByBusinessType() {
  const sheet = getSheet();
  if (!sheet) return { businessTypes: [] };
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { businessTypes: [] };
  
  const dataRange = sheet.getRange(2, 4, lastRow - 1, 1);
  const types = dataRange.getValues().flat();
  
  const typeCounts = {};
  types.forEach(type => {
    if (type) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  });
  
  const typeArray = Object.keys(typeCounts).map(key => ({
    name: key,
    count: typeCounts[key],
    percentage: ((typeCounts[key] / types.length) * 100).toFixed(1)
  }));
  
  typeArray.sort((a, b) => b.count - a.count);
  
  return {
    businessTypes: typeArray,
    total: types.length
  };
}

/**
 * Get lead trend over time
 */
function getLeadsTrend(days = 30) {
  const sheet = getSheet();
  if (!sheet) return { trend: [] };
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { trend: [] };
  
  const dataRange = sheet.getRange(2, 1, lastRow - 1, 1);
  const timestamps = dataRange.getValues().flat();
  
  const now = new Date();
  const trendData = {};
  
  // Initialize last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    trendData[dateStr] = 0;
  }
  
  // Count leads per day
  timestamps.forEach(timestamp => {
    if (timestamp) {
      const dateStr = timestamp.toString().split(' ')[0];
      if (trendData.hasOwnProperty(dateStr)) {
        trendData[dateStr]++;
      }
    }
  });
  
  const trendArray = Object.keys(trendData).map(date => ({
    date: date,
    count: trendData[date]
  }));
  
  return {
    trend: trendArray,
    days: days
  };
}

/**
 * Get recent leads
 */
function getRecentLeads(limit = 10) {
  const sheet = getSheet();
  if (!sheet) return { leads: [] };
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { leads: [] };
  
  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;
  
  const dataRange = sheet.getRange(startRow, 1, numRows, 6);
  const data = dataRange.getValues();
  
  const leads = data.map(row => ({
    timestamp: row[0] ? row[0].toString() : '',
    name: row[1] || '',
    mobile: row[2] || '',
    businessType: row[3] || '',
    leadSource: row[4] || '',
    notes: row[5] || ''
  }));
  
  leads.reverse();
  
  return {
    leads: leads,
    count: leads.length
  };
}

/**
 * Get detailed statistics
 */
function getDetailedStats() {
  const sheet = getSheet();
  if (!sheet) return getEmptyStats();
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return getEmptyStats();
  
  const dataRange = sheet.getRange(2, 1, lastRow - 1, 6);
  const data = dataRange.getValues();
  
  const now = new Date();
  
  // Calculate yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  
  // Calculate last week
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 14);
  const lastWeekEnd = new Date(now);
  lastWeekEnd.setDate(now.getDate() - 7);
  
  let yesterdayCount = 0;
  let lastWeekCount = 0;
  
  data.forEach(row => {
    const timestamp = row[0] ? row[0].toString() : '';
    const dateStr = timestamp.split(' ')[0];
    
    if (dateStr === yesterdayStr) {
      yesterdayCount++;
    }
    
    const rowDate = parseDate(dateStr);
    if (rowDate >= lastWeekStart && rowDate < lastWeekEnd) {
      lastWeekCount++;
    }
  });
  
  const overview = getOverviewData();
  
  // Calculate growth rates
  const todayVsYesterday = yesterdayCount > 0 
    ? (((overview.today - yesterdayCount) / yesterdayCount) * 100).toFixed(1)
    : overview.today > 0 ? 100 : 0;
  
  const weekVsLastWeek = lastWeekCount > 0
    ? (((overview.week - lastWeekCount) / lastWeekCount) * 100).toFixed(1)
    : overview.week > 0 ? 100 : 0;
  
  return {
    overview: overview,
    growth: {
      todayVsYesterday: parseFloat(todayVsYesterday),
      weekVsLastWeek: parseFloat(weekVsLastWeek)
    },
    averages: {
      perDay: (overview.total / 30).toFixed(1),
      perWeek: (overview.total / 4).toFixed(1)
    }
  };
}

/**
 * Helper functions
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME);
}

function getEmptyOverview() {
  return {
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    lastUpdated: new Date().toISOString()
  };
}

function getEmptyStats() {
  return {
    overview: getEmptyOverview(),
    growth: {
      todayVsYesterday: 0,
      weekVsLastWeek: 0
    },
    averages: {
      perDay: 0,
      perWeek: 0
    }
  };
}

function isDateAfterOrEqual(dateStr1, dateStr2) {
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);
  return date1 >= date2;
}

function parseDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}

function getISTTimestamp() {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (IST_OFFSET * 3600000));
  
  const day = String(istTime.getDate()).padStart(2, '0');
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const year = istTime.getFullYear();
  const hours = String(istTime.getHours()).padStart(2, '0');
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function validateData(data) {
  if (!data) {
    return { isValid: false, error: 'No data received' };
  }
  
  if (!data.name || data.name.trim().length < 2) {
    return { isValid: false, error: 'Invalid name' };
  }
  
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!data.mobile || !mobileRegex.test(data.mobile)) {
    return { isValid: false, error: 'Invalid mobile number' };
  }
  
  const validBusinessTypes = ['Manufacturing', 'Retail', 'Service', 'Trading', 'Other'];
  if (!data.businessType || !validBusinessTypes.includes(data.businessType)) {
    return { isValid: false, error: 'Invalid business type' };
  }
  
  const validLeadSources = ['Walk-in', 'Phone Call', 'WhatsApp', 'Referral', 'Exhibition', 'Website'];
  if (!data.leadSource || !validLeadSources.includes(data.leadSource)) {
    return { isValid: false, error: 'Invalid lead source' };
  }
  
  return { isValid: true };
}

function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test functions
 */
function testSetup() {
  const testData = {
    name: 'Test User',
    mobile: '9876543210',
    businessType: 'Retail',
    leadSource: 'Website',
    notes: 'This is a test lead'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const response = doPost(mockEvent);
  Logger.log('Test Response: ' + response.getContent());
}

function testAnalytics() {
  Logger.log('=== Overview ===');
  Logger.log(JSON.stringify(getOverviewData(), null, 2));
  
  Logger.log('\n=== Sources ===');
  Logger.log(JSON.stringify(getLeadsBySource(), null, 2));
  
  Logger.log('\n=== Business Types ===');
  Logger.log(JSON.stringify(getLeadsByBusinessType(), null, 2));
  
  Logger.log('\n=== Trend ===');
  Logger.log(JSON.stringify(getLeadsTrend(7), null, 2));
  
  Logger.log('\n=== Recent Leads ===');
  Logger.log(JSON.stringify(getRecentLeads(5), null, 2));
  
  Logger.log('\n=== Stats ===');
  Logger.log(JSON.stringify(getDetailedStats(), null, 2));
}
