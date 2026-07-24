/**
 * Zod schemas for all MCP tool input validation
 */
import { z } from 'zod';

// === Web Search ===
export const WebSearchSchema = z.object({
  query: z.string().min(1, 'Query é obrigatória').max(500, 'Query muito longa'),
  engine: z.enum(['google', 'duckduckgo', 'bing']).default('duckduckgo'),
  max_results: z.number().int().min(1).max(10).default(5),
});

// === Fetch Website ===
export const FetchWebsiteSchema = z.object({
  url: z.string().url('URL inválida'),
  selector: z.string().optional(),
});

// === MCP Server Discovery ===
export const ListMCPServersSchema = z.object({
  category: z
    .enum(['all', 'productivity', 'development', 'data', 'ai', 'communication'])
    .default('all'),
});

export const SearchMCPServersSchema = z.object({
  keyword: z.string().min(1, 'Keyword é obrigatória').max(100),
});

export const GetMCPServerInfoSchema = z.object({
  server_name: z.string().min(1, 'server_name é obrigatório'),
});

// === Patches ===
export const ListPatchesSchema = z.object({
  status: z.enum(['all', 'pending', 'applied', 'failed']).default('all'),
});

export const ApplyPatchSchema = z.object({
  patch_id: z.string().min(1, 'patch_id é obrigatório'),
  target_file: z.string().optional(),
});

// === Modules ===
export const ListModulesSchema = z.object({
  category: z.string().optional(),
});

export const GetModuleInfoSchema = z.object({
  module_name: z.string().min(1, 'module_name é obrigatório'),
});

// === Practices ===
export const ListPracticesSchema = z.object({
  category: z
    .enum(['all', 'security', 'performance', 'code-quality', 'testing', 'documentation'])
    .default('all'),
});

export const GetPracticeDetailsSchema = z.object({
  practice_id: z.string().min(1, 'practice_id é obrigatório'),
});

// === Calculate ===
export const CalculateSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt']),
  a: z.number(),
  b: z.number().optional(),
});

// === Generate Password ===
export const GeneratePasswordSchema = z.object({
  length: z.number().int().min(8).max(128).default(16),
  includeUppercase: z.boolean().default(true),
  includeLowercase: z.boolean().default(true),
  includeNumbers: z.boolean().default(true),
  includeSymbols: z.boolean().default(true),
});

// === Validate CPF ===
export const ValidateCPFSchema = z.object({
  cpf: z.string().min(11, 'CPF deve conter pelo menos 11 dígitos'),
});

// === Generate UUID ===
export const GenerateUUIDSchema = z.object({
  count: z.number().int().min(1).max(10).default(1),
});

// === Get Current Time ===
export const GetCurrentTimeSchema = z.object({
  timezone: z.string().default('America/Sao_Paulo'),
  format: z.enum(['iso', 'unix', 'readable']).default('iso'),
});

// === Encode/Decode Base64 ===
export const EncodeDecodeBase64Schema = z.object({
  text: z.string().min(1, 'Texto é obrigatório'),
  operation: z.enum(['encode', 'decode']),
});

// === Health Check ===
export const HealthCheckSchema = z.object({
  detailed: z.boolean().default(false),
});

// Type exports
export type WebSearchInput = z.infer<typeof WebSearchSchema>;
export type FetchWebsiteInput = z.infer<typeof FetchWebsiteSchema>;
export type ListMCPServersInput = z.infer<typeof ListMCPServersSchema>;
export type SearchMCPServersInput = z.infer<typeof SearchMCPServersSchema>;
export type GetMCPServerInfoInput = z.infer<typeof GetMCPServerInfoSchema>;
export type ListPatchesInput = z.infer<typeof ListPatchesSchema>;
export type ApplyPatchInput = z.infer<typeof ApplyPatchSchema>;
export type ListModulesInput = z.infer<typeof ListModulesSchema>;
export type GetModuleInfoInput = z.infer<typeof GetModuleInfoSchema>;
export type ListPracticesInput = z.infer<typeof ListPracticesSchema>;
export type GetPracticeDetailsInput = z.infer<typeof GetPracticeDetailsSchema>;
export type CalculateInput = z.infer<typeof CalculateSchema>;
export type GeneratePasswordInput = z.infer<typeof GeneratePasswordSchema>;
export type ValidateCPFInput = z.infer<typeof ValidateCPFSchema>;
export type GenerateUUIDInput = z.infer<typeof GenerateUUIDSchema>;
export type GetCurrentTimeInput = z.infer<typeof GetCurrentTimeSchema>;
export type EncodeDecodeBase64Input = z.infer<typeof EncodeDecodeBase64Schema>;
export type HealthCheckInput = z.infer<typeof HealthCheckSchema>;
