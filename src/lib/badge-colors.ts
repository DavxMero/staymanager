
export const getBadgeColor = (variant: string): string => {
  switch (variant) {
    case 'success':
    case 'healthy':
    case 'operational':
    case 'connected':
    case 'active':
    case 'ready':
    case 'recommended':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    
    case 'warning':
    case 'pending':
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    
    case 'error':
    case 'failed':
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    
    case 'info':
    case 'available':
    case 'testing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    
    case 'neutral':
    case 'unknown':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
    
    case 'high-priority':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    
    case 'medium-priority':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    
    case 'low-priority':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
    
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
  }
}

export const getCardBgColor = (variant?: string): string => {
  switch (variant) {
    case 'success':
      return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
    case 'error':
      return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
    case 'info':
      return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    default:
      return 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
  }
}

export const getTextColor = (variant: string): string => {
  switch (variant) {
    case 'success':
      return 'text-green-700 dark:text-green-300'
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-300'
    case 'error':
      return 'text-red-700 dark:text-red-300'
    case 'info':
      return 'text-blue-700 dark:text-blue-300'
    default:
      return 'text-gray-700 dark:text-gray-300'
  }
}