ALTER TABLE "User"
ADD COLUMN "transactionPin" TEXT;

ALTER TABLE "Transaction"
ADD COLUMN "providerReference" TEXT,
ADD COLUMN "providerStatus" TEXT,
ADD COLUMN "failureReason" TEXT,
ADD COLUMN "recipientBankCode" TEXT,
ADD COLUMN "recipientAccountNumber" TEXT,
ADD COLUMN "recipientName" TEXT;

ALTER TYPE "TransactionType" ADD VALUE 'SEND_MONEY';
