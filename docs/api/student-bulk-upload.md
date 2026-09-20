# Student bulk upload API

Base: `/api/v1/student`  
Permission: `BULK_UPLOAD_STUDENTS` (except sample sheet: `GET_BULK_UPLOAD_SHEET`)

## Start import (async)

`POST /bulk-upload` (multipart: `file`, `branchId`, `className`, `sectionId`)

Returns **202**:
```json
{ "success": true, "message": "Bulk upload started", "data": { "jobId": "...", "status": "PENDING" } }
```

## List jobs

`GET /bulk-upload-jobs?branchId=`

## Job detail

`GET /bulk-upload-jobs/:jobId`  
(`filePath` is never returned)

## Job rows

`GET /bulk-upload-jobs/:jobId/rows?status=SUCCESS|FAILED|PENDING`

## Export rows (Excel)

`GET /bulk-upload-jobs/:jobId/export?status=SUCCESS|FAILED`  
Permission: `BULK_UPLOAD_STUDENTS`

Returns JSON (same pattern as sample sheet):
```json
{
  "success": true,
  "message": "Succeeded students exported",
  "data": {
    "fileName": "import-succeeded.xlsx",
    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "fileContent": "<base64>"
  }
}
```

Columns (succeeded): `rowNumber`, `studentName`, `admissionNo`, `status`, `studentId`, `errorMessage`

Failed export: copies each failed student's original uploaded row into a new sheet (same field columns/values), plus a trailing `errorMessage` column. No red styling — users can fix rows and re-upload the file.

## Sample sheet

`GET /download-bulk-sample` — unchanged
