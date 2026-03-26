import { ErrorHandler, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private router = inject(Router);

  handleError(error: Error): void {
    console.error('Global error:', error);
    
    // Log to console in development
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    // In production, you would send this to a logging service
    // Example: this.loggingService.logError(error);
  }
}
