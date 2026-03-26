import 'express-async-errors';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@shared/utils/swagger';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

import authRoutes from '@modules/auth/auth.routes';
import userRoutes from '@modules/user/user.routes';
import walletRoutes from '@modules/wallet/wallet.routes';
import transactionRoutes from '@modules/transaction/transaction.routes';
import cushionRoutes from '@modules/cushion/cushion.routes';
import cardRoutes from '@modules/card/card.routes';
import transferRoutes from '@modules/transfers/transfer.routes';

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/wallet', walletRoutes);
app.use('/transactions', transactionRoutes);
app.use('/cushion', cushionRoutes);
app.use('/card', cardRoutes);
app.use('/transfers', transferRoutes);
// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
