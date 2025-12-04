import { databases, APPWRITE_CONFIG } from '../appwrite';
import { ID, Query } from 'appwrite';
import { QuotaStatus } from './types';

const QUOTA_LIMITS: Record<string, { daily: number; monthly: number }> = {
  brave: { daily: 67, monthly: 2000 },
  youtube: { daily: 99, monthly: 3000 },
  gemini: { daily: 1500, monthly: 45000 },
  groq: { daily: 100, monthly: 3000 }
};

const QUOTA_COLLECTION_ID = 'api_quotas';

export async function checkQuota(service: string): Promise<QuotaStatus> {
  try {
    const docs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      QUOTA_COLLECTION_ID,
      [Query.equal('service', service)]
    );

    let quota = docs.documents[0];

    if (!quota) {
      // Initialize quota tracking for service
      quota = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        QUOTA_COLLECTION_ID,
        ID.unique(),
        {
          service,
          used_daily: 0,
          used_monthly: 0,
          last_reset_daily: new Date().toISOString(),
          last_reset_monthly: new Date().toISOString(),
          limit_daily: QUOTA_LIMITS[service]?.daily || 100,
          limit_monthly: QUOTA_LIMITS[service]?.monthly || 3000
        }
      );
    }

    // Check if reset needed
    const now = new Date();
    const lastResetDaily = new Date(quota.last_reset_daily);
    const lastResetMonthly = new Date(quota.last_reset_monthly);

    let needsUpdate = false;
    const updates: any = {};

    if (now.getDate() !== lastResetDaily.getDate() || now.getMonth() !== lastResetDaily.getMonth()) {
      // Daily reset
      updates.used_daily = 0;
      updates.last_reset_daily = now.toISOString();
      needsUpdate = true;
    }

    if (now.getMonth() !== lastResetMonthly.getMonth() || now.getFullYear() !== lastResetMonthly.getFullYear()) {
      // Monthly reset
      updates.used_monthly = 0;
      updates.last_reset_monthly = now.toISOString();
      needsUpdate = true;
    }

    if (needsUpdate) {
      quota = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        QUOTA_COLLECTION_ID,
        quota.$id,
        updates
      );
    }

    const canUse = (quota.used_daily || 0) < quota.limit_daily &&
                   (quota.used_monthly || 0) < quota.limit_monthly;

    return {
      service,
      usedDaily: quota.used_daily || 0,
      usedMonthly: quota.used_monthly || 0,
      limitDaily: quota.limit_daily,
      limitMonthly: quota.limit_monthly,
      percentageUsedDaily: ((quota.used_daily || 0) / quota.limit_daily) * 100,
      percentageUsedMonthly: ((quota.used_monthly || 0) / quota.limit_monthly) * 100,
      canUse
    };
  } catch (error) {
    console.error('Quota check error:', error);
    // Return permissive quota on error
    return {
      service,
      usedDaily: 0,
      usedMonthly: 0,
      limitDaily: QUOTA_LIMITS[service]?.daily || 100,
      limitMonthly: QUOTA_LIMITS[service]?.monthly || 3000,
      percentageUsedDaily: 0,
      percentageUsedMonthly: 0,
      canUse: true
    };
  }
}

export async function incrementQuota(service: string): Promise<void> {
  try {
    const docs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      QUOTA_COLLECTION_ID,
      [Query.equal('service', service)]
    );

    if (docs.documents[0]) {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        QUOTA_COLLECTION_ID,
        docs.documents[0].$id,
        {
          used_daily: (docs.documents[0].used_daily || 0) + 1,
          used_monthly: (docs.documents[0].used_monthly || 0) + 1
        }
      );
    }
  } catch (error) {
    console.error('Quota increment error:', error);
  }
}

export async function getAllQuotas(): Promise<QuotaStatus[]> {
  const services = ['brave', 'youtube', 'gemini', 'groq'];
  const quotas = await Promise.all(services.map(service => checkQuota(service)));
  return quotas;
}
