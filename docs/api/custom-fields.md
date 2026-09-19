# Custom fields API

Base: `/api/v1/school`  
Auth: bearer token + branch access + named permission.

## Create

`POST /create-customField`  
Permission: `CREATE_CUSTOM_FIELD`

Body: `name`, `label`, `entityType`, `type`, `required`, `options`, `branchId`

## List

`GET /get-customField?branchId=&entityType=`  
Permission: `GET_CUSTOM_FIELD`

## Update

`PUT /update-customField/:id`  
Permission: `UPDATE_CUSTOM_FIELD`

Body: `name`, `label`, `type`, `required`, `options`, optional `branchId`, optional `entityType` (must match stored value).

`entityType` and `branchId` cannot be changed. Duplicate `name` in the same branch returns 409.

Success: `{ success: true, message, data: CustomField }`
