import type {
  FieldCategory,
  FieldResolverType,
  Permission,
  RegistryDataType,
  SourceModule,
} from "../../../generated/prisma/index.js";

export type FieldDefinition = {
  fieldKey: string;
  label: string;
  description?: string;
  sourceModule: SourceModule;
  sourceTable: string;
  sourceColumn?: string;
  fieldCategory: FieldCategory;
  dataType: RegistryDataType;
  enumName?: string;
  resolverType: FieldResolverType;
  resolverConfig?: Record<string, unknown>;
  isFilterable?: boolean;
  isSortable?: boolean;
  isExportable?: boolean;
  isVisibleInPicker?: boolean;
  isSystemField?: boolean;
  groupKey?: string;
  displayOrder?: number;
  requiredPermission?: Permission;
  schemaVersion?: number;
};
