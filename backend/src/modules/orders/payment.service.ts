import { logger } from '../../utils/logger.js';

export interface PaymentResult {
  success: boolean;
  transactionId: string;
}

export const mockPaymentService = {
  async charge(amount: number, cardholderName: string): Promise<PaymentResult> {
    const transactionId = `mock_${Date.now()}`;

    logger.info({ amount, cardholderName, transactionId }, 'Mock payment processed');

    return {
      success: true,
      transactionId,
    };
  },
};
