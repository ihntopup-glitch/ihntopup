import { config } from 'dotenv';
config();

import '@/ai/flows/order-update-notifications.ts';
import '@/ai/flows/handle-referral.ts';
import '@/ai/flows/handle-wallet-request.ts';
