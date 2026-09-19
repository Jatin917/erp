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

## Sample sheet

`GET /download-bulk-sample` — unchanged
