// Error handling utilities for consistent error management

export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
}

export class TrainingError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(code: string, message: string, public readonly details?: string) {
    super(message);
    this.name = 'TrainingError';
    this.code = code;
    this.timestamp = new Date();
  }
}

// Error codes for different scenarios
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Data errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DATA_CONFLICT: 'DATA_CONFLICT',
  
  // Training specific errors
  TRAINING_SESSION_ERROR: 'TRAINING_SESSION_ERROR',
  AI_FEEDBACK_ERROR: 'AI_FEEDBACK_ERROR',
  ASSESSMENT_ERROR: 'ASSESSMENT_ERROR',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED'
} as const;

// User-friendly error messages in Chinese
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.API_TIMEOUT]: '请求超时，请稍后重试',
  [ERROR_CODES.SERVER_ERROR]: '服务器错误，请稍后重试',
  
  [ERROR_CODES.UNAUTHORIZED]: '请先登录',
  [ERROR_CODES.FORBIDDEN]: '没有权限执行此操作',
  
  [ERROR_CODES.VALIDATION_ERROR]: '输入数据不合法',
  [ERROR_CODES.DATA_NOT_FOUND]: '数据不存在',
  [ERROR_CODES.DATA_CONFLICT]: '数据冲突，请刷新后重试',
  
  [ERROR_CODES.TRAINING_SESSION_ERROR]: '训练会话出错，请重新开始',
  [ERROR_CODES.AI_FEEDBACK_ERROR]: 'AI反馈生成失败，请稍后重试',
  [ERROR_CODES.ASSESSMENT_ERROR]: '评估过程出错，请重新尝试',
  
  [ERROR_CODES.FILE_TOO_LARGE]: '文件太大，请选择小于5MB的文件',
  [ERROR_CODES.INVALID_FILE_TYPE]: '文件类型不支持，请选择图片文件',
  [ERROR_CODES.UPLOAD_FAILED]: '文件上传失败，请重试'
};

// Convert HTTP status codes to error codes
export function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.DATA_NOT_FOUND;
    case 409:
      return ERROR_CODES.DATA_CONFLICT;
    case 408:
      return ERROR_CODES.API_TIMEOUT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_CODES.SERVER_ERROR;
    default:
      return ERROR_CODES.NETWORK_ERROR;
  }
}

// Create user-friendly error from any error
export function createUserError(error: unknown): AppError {
  const timestamp = new Date();
  
  if (error instanceof TrainingError) {
    return {
      code: error.code,
      message: ERROR_MESSAGES[error.code] || error.message,
      details: error.details,
      timestamp
    };
  }
  
  if (error instanceof Error) {
    // Check if it's a fetch error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        details: error.message,
        timestamp
      };
    }
    
    return {
      code: ERROR_CODES.SERVER_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR],
      details: error.message,
      timestamp
    };
  }
  
  return {
    code: ERROR_CODES.SERVER_ERROR,
    message: '未知错误',
    details: String(error),
    timestamp
  };
}

// Log error for debugging
export function logError(error: AppError) {
  console.error(`[${error.timestamp.toISOString()}] ${error.code}: ${error.message}`, {
    details: error.details
  });
}

// Retry mechanism for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}