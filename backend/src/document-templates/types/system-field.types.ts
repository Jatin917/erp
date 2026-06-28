export interface SystemFieldRecord {
  id: string;
  entityType: string;
  displayName: string;
  fieldPath: string;
  fieldType: string;
}

export interface SystemFieldSearchFilter {
  entityType?: string;
  query?: string;
}