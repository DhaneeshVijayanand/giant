# GIANT: POWER BI REPORT BUILD & INTEGRATION GUIDE

A step-by-step engineering and business intelligence guide for building the official `.pbix` report file in **Power BI Desktop**, configuring data models and DAX measures, and embedding into the **Giant Platform**.

---

## 1. Architecture Overview & Data Connection Options

Power BI can ingest Giant's reporting data layer using two secure methods:

### Option A: Direct PostgreSQL Database Connection (Recommended for DirectQuery)
- **Host**: Your PostgreSQL host / IP address
- **Database**: `giant`
- **View**: `v_powerbi_news_reporting`
- **Credentials**: Read-only user `giant_powerbi_reader` (see `backend/scripts/setup_powerbi_readonly_user.sql`)
- **DirectQuery Rationale**: Enables real-time updates as soon as the APScheduler ingests new RSS items, without waiting for scheduled hourly refreshes.

### Option B: Giant Direct REST Web Feed (Zero Gateway / Cloud Friendly)
- **Connector**: Power BI Desktop > *Get Data* > *Web*
- **URL**: `http://localhost:8000/api/v1/powerbi/data-feed?format=csv` (or your deployed backend URL `/api/v1/powerbi/data-feed?format=csv`)
- **Authentication**: Anonymous / Basic API token
- **Scheduled Refresh Rationale**: Allows Power BI Service cloud-to-cloud automated refresh without setting up an On-premises Data Gateway.

---

## 2. Data Model & Schema Mapping

The ingested dataset contains the following reporting columns:

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `article_id` | Whole Number | Unique integer primary key of the article |
| `headline` | Text | Article title / headline |
| `source` | Text | Publisher name (e.g. *ET Telecom*, *LiveMint*, *NPCI*) |
| `original_url` | Text (Web URL) | Canonical article URL for clickable drill-through |
| `publication_timestamp` | Date/Time | Verified source publication timestamp |
| `retrieval_timestamp` | Date/Time | Application ingestion timestamp |
| `industry` | Text | Sector (`telecom`, `fintech`, `ev`) |
| `company` | Text | Primary referenced entity (e.g. *Reliance Jio*, *PhonePe*, *Tata Motors*) |
| `topic` | Text | Primary categorized topic (e.g. *Spectrum*, *UPI*, *Battery*) |
| `country` | Text | Geographical focus (*India* or *Global*) |
| `sentiment` | Text | AI classification (*positive*, *neutral*, *negative*) |
| `business_impact` | Text | Market classification (*high*, *medium*, *low*) |
| `verification_status` | Text | Audit status (*verified*) |

> **IMPORTANT**: Set the **Data Category** of `original_url` to **Web URL** in Power BI Desktop (Modeling tab > Properties > Data category > Web URL). This enables clickable hyperlinks in table visuals.

---

## 3. Core DAX Measures

Create a dedicated DAX measures table (`_Measures`) and define the following formulas:

```dax
// 1. Total Retrieved Articles
Total Retrieved Articles = 
COUNTROWS('Articles')

// 2. Positive Sentiment Rate
Positive Sentiment Rate = 
DIVIDE(
    CALCULATE(COUNTROWS('Articles'), 'Articles'[sentiment] = "positive"),
    [Total Retrieved Articles],
    0
)

// 3. Neutral Sentiment Rate
Neutral Sentiment Rate = 
DIVIDE(
    CALCULATE(COUNTROWS('Articles'), 'Articles'[sentiment] = "neutral"),
    [Total Retrieved Articles],
    0
)

// 4. Negative Sentiment Rate
Negative Sentiment Rate = 
DIVIDE(
    CALCULATE(COUNTROWS('Articles'), 'Articles'[sentiment] = "negative"),
    [Total Retrieved Articles],
    0
)

// 5. High Impact Ratio
High Impact Ratio = 
DIVIDE(
    CALCULATE(COUNTROWS('Articles'), 'Articles'[business_impact] = "high"),
    [Total Retrieved Articles],
    0
)

// 6. Articles in the Last 7 Days
Articles Last 7 Days = 
CALCULATE(
    [Total Retrieved Articles],
    DATESINPERIOD('Articles'[publication_timestamp], TODAY(), -7, DAY)
)
```

---

## 4. Visualizations & Layout Guide (11 Visuals)

Organize the Canvas across a standard 16:9 widescreen layout with dark navy theme (`#0B1120` canvas background):

1. **Total Retrieved Articles**:
   - Visual: **Card**
   - Field: `[Total Retrieved Articles]`
   - Callout Value: `#38BDF8` (Sky blue).

2. **News Volume Over Time**:
   - Visual: **Area Chart** or **Line Chart**
   - X-Axis: `Articles[publication_timestamp]` (Date Hierarchy by Month / Day)
   - Y-Axis: `[Total Retrieved Articles]`
   - Legend: `Articles[industry]`.

3. **Sentiment Classification**:
   - Visual: **Donut Chart**
   - Legend: `Articles[sentiment]`
   - Values: `[Total Retrieved Articles]`
   - Colors: Positive (`#10B981` Emerald), Neutral (`#94A3B8` Slate), Negative (`#F43F5E` Rose).

4. **Most-Mentioned Companies**:
   - Visual: **Horizontal Clustered Bar Chart**
   - Y-Axis: `Articles[company]` (Top 8 filtered by value)
   - X-Axis: `[Total Retrieved Articles]`.

5. **Competitor News Comparison**:
   - Visual: **100% Stacked Bar Chart**
   - Y-Axis: `Articles[company]`
   - X-Axis: `[Total Retrieved Articles]`
   - Legend: `Articles[business_impact]` (High, Medium, Low).

6. **Emerging Topics**:
   - Visual: **Treemap**
   - Category: `Articles[topic]`
   - Values: `[Total Retrieved Articles]`.

7. **Technology Trends**:
   - Visual: **Clustered Column Chart**
   - Filtered for technology topics (e.g. *5G*, *LEO Satellite*, *FWA*, *Battery*, *LFP*, *Soundbox*)
   - X-Axis: `Articles[topic]`
   - Y-Axis: `[Total Retrieved Articles]`.

8. **Regulatory Updates**:
   - Visual: **Table Visual**
   - Filtered for regulatory terms (e.g. *TRAI*, *DoT*, *RBI*, *NPCI*, *Vahan*, *Policy*)
   - Columns: `publication_timestamp`, `headline`, `source`, `original_url`.

9. **Business Risks and Opportunities**:
   - Visual: **Matrix**
   - Rows: `Articles[company]`
   - Columns: `Articles[business_impact]`
   - Values: `[Total Retrieved Articles]`.

10. **News by Region**:
    - Visual: **Clustered Column Chart**
    - X-Axis: `Articles[country]` (*India* vs *Global*)
    - Y-Axis: `[Total Retrieved Articles]`.

11. **Detailed News Table with Clickable Source Links**:
    - Visual: **Table Visual**
    - Columns: `headline`, `source`, `company`, `sentiment`, `business_impact`, `publication_timestamp`, `original_url`
    - Under *Format Visual* > *Specific column* > `original_url`:
      - Turn on **URL icon** (displays a compact link icon instead of the raw URL). Clicking opens the publisher's authentic source article in a new browser tab.

---

## 5. Slicers, Cross-Filtering & Drill-Through

Add a top filter panel with:
- **Industry Slicer**: Dropdown slicer mapped to `Articles[industry]` (Telecom, Fintech, EV). This slicer is automatically driven by Giant's web application when embedded.
- **Date Range Slicer**: Relative Date Slicer (e.g. *Last 30 Days*, *Last 90 Days*).
- **Company Slicer**: Dropdown with search enabled.
- **Sentiment & Impact Slicers**: Horizontal buttons/tiles for quick filtering.

---

## 6. Publishing, Workspace Setup & Embed Token Configuration

1. **Save and Publish**:
   - Save the file as `Giant_Industry_Intelligence.pbix`.
   - Click **Publish** > Select your designated Power BI Workspace (e.g. `Giant Intelligence Production`).

2. **Service Principal Access**:
   - Go to `app.powerbi.com` > Open the workspace > **Manage Access**.
   - Add your Microsoft Entra App Registration (Service Principal) as a **Member**.

3. **Obtain Workspace, Report & Dataset IDs**:
   - Open the published report in your browser.
   - Look at the browser address bar:
     `https://app.powerbi.com/groups/{WORKSPACE_ID}/reports/{REPORT_ID}/ReportSection`
   - Copy the `{WORKSPACE_ID}` and `{REPORT_ID}` into your backend `.env` file:
     ```env
     POWERBI_CLIENT_ID=<Azure-AD-Client-ID>
     POWERBI_CLIENT_SECRET=<Azure-AD-Client-Secret>
     POWERBI_TENANT_ID=<Azure-AD-Tenant-ID>
     POWERBI_WORKSPACE_ID=<Workspace-GUID>
     POWERBI_REPORT_ID=<Report-GUID>
     POWERBI_DATASET_ID=<Semantic-Model-GUID>
     ```

4. **Verify Embedding in Giant**:
   - Start the backend and open `http://localhost:5173/industry/telecom/news-bi`.
   - The platform calls `/api/v1/powerbi/embed-config?industry=telecom`, receives the short-lived embed token, and renders the interactive report with the telecom filter applied automatically.
