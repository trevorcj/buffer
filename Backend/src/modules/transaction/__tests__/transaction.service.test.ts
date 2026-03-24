jest.mock('@infrastructure/db/prisma', () => ({
  __esModule: true,
  default: {}
}));
import { TransactionService } from '../transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
  });

  describe('calculateSavings', () => {
    it('should calculate percentage based savings for AGBA mode', () => {
      const settings = { savingMode: 'AGBA', percentage: 5 } as any;
      const amount = 1000;
      
      // Accessing private method for unit testing the math
      const savings = (service as any).calculateSavings(amount, settings);
      
      expect(savings).toBe(50); // 5% of 1000
    });

    it('should calculate round up savings for YAKUBU mode', () => {
      const settings = { savingMode: 'YAKUBU', roundUpThreshold: 100 } as any;
      
      const amount1 = 1040;
      const savings1 = (service as any).calculateSavings(amount1, settings);
      expect(savings1).toBe(60); // Rounds up to 1100 -> 60 difference

      const amount2 = 1100;
      const savings2 = (service as any).calculateSavings(amount2, settings);
      expect(savings2).toBe(0); // Perfect multiple, no savings
    });
  });
});
