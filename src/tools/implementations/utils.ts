/**
 * Utility tool implementations (calculate, password, CPF, UUID, time, base64)
 */
import type { MCPToolResult } from '../../core/types/index.js';
import { logger } from '../../core/logger/index.js';
import { eventBus, EVENTS } from '../../core/events/index.js';
import {
  calculate as calculateUtil,
  generatePassword as generatePasswordUtil,
  generateUUIDs,
  encodeBase64,
  decodeBase64,
  getCurrentTime as getCurrentTimeUtil,
  validateCPF as validateCPFUtil,
  jsonResponse,
} from '../../utils/index.js';
import type {
  CalculateInput,
  GeneratePasswordInput,
  ValidateCPFInput,
  GenerateUUIDInput,
  GetCurrentTimeInput,
  EncodeDecodeBase64Input,
} from '../schemas/index.js';

export async function calculateTool(args: CalculateInput): Promise<MCPToolResult> {
  const { operation, a, b } = args;
  const result = calculateUtil(operation, a, b);
  logger.debug('Calculate tool executed', { operation, a, b, result });
  return {
    content: [{ type: 'text', text: jsonResponse({ operation, a, b, result }) }],
  };
}

export async function generatePasswordTool(args: GeneratePasswordInput): Promise<MCPToolResult> {
  const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = args;
  const password = generatePasswordUtil(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols);
  logger.debug('Password generated', { length });
  return {
    content: [
      {
        type: 'text',
        text: jsonResponse({
          password,
          length,
          includes: { uppercase: includeUppercase, lowercase: includeLowercase, numbers: includeNumbers, symbols: includeSymbols },
        }),
      },
    ],
  };
}

export async function validateCPFTool(args: ValidateCPFInput): Promise<MCPToolResult> {
  const { cpf } = args;
  const result = validateCPFUtil(cpf);
  logger.debug('CPF validated', { valid: result.valid });
  return {
    content: [{ type: 'text', text: jsonResponse(result) }],
  };
}

export async function generateUUIDTool(args: GenerateUUIDInput): Promise<MCPToolResult> {
  const { count } = args;
  const uuids = generateUUIDs(count);
  logger.debug('UUIDs generated', { count });
  return {
    content: [{ type: 'text', text: jsonResponse({ uuids, count }) }],
  };
}

export async function getCurrentTimeTool(args: GetCurrentTimeInput): Promise<MCPToolResult> {
  const { timezone, format } = args;
  try {
    const result = getCurrentTimeUtil(timezone, format);
    logger.debug('Current time retrieved', { timezone, format });
    return {
      content: [{ type: 'text', text: jsonResponse(result) }],
    };
  } catch {
    throw new Error(`Fuso horário inválido: ${timezone}`);
  }
}

export async function encodeDecodeBase64Tool(args: EncodeDecodeBase64Input): Promise<MCPToolResult> {
  const { text, operation } = args;
  let result: string;
  try {
    if (operation === 'encode') {
      result = encodeBase64(text);
    } else {
      result = decodeBase64(text);
    }
  } catch {
    throw new Error('Erro ao processar Base64. Verifique se o texto está correto.');
  }
  logger.debug('Base64 operation completed', { operation });
  return {
    content: [
      {
        type: 'text',
        text: jsonResponse({ operation, original: text, result, originalLength: text.length, resultLength: result.length }),
      },
    ],
  };
}
