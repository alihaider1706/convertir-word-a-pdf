import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/stripe';

export interface UsageCheckResult {
  allowed: boolean;
  isPro: boolean;
  planType: string;
  reason?: 'DAILY_LIMIT_REACHED' | 'FILE_SIZE_EXCEEDED';
  maxAllowed?: number;
  remaining?: number;
  message?: string;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function checkAndIncrementUsage(
  request: NextRequest,
  fileSizeInBytes: number = 0
): Promise<UsageCheckResult> {
  try {
    const session = await getServerSession(authOptions);
    const today = getTodayDateString();
    const fileSizeMb = fileSizeInBytes / (1024 * 1024);

    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    const isPro = user?.planType === 'PRO_MONTHLY' || user?.planType === 'PRO_YEARLY';
    const planType = user?.planType || 'FREE';

    // 1. Check file size limits
    const maxFileSizeMb = isPro ? PLANS.PRO_MONTHLY.maxFileSizeMb : PLANS.FREE.maxFileSizeMb;
    if (fileSizeMb > maxFileSizeMb) {
      return {
        allowed: false,
        isPro,
        planType,
        reason: 'FILE_SIZE_EXCEEDED',
        maxAllowed: maxFileSizeMb,
        message: `El archivo supera el límite de ${maxFileSizeMb}MB para tu plan ${isPro ? 'Pro' : 'Gratuito'}.`,
      };
    }

    // 2. Pro users have unlimited daily conversions
    if (isPro && user) {
      // Record conversion history
      await prisma.conversionRecord.create({
        data: {
          userId: user.id,
          fileName: 'documento',
          fileSize: fileSizeInBytes,
          conversionType: 'conversion',
        },
      });

      return {
        allowed: true,
        isPro: true,
        planType,
        remaining: Infinity,
      };
    }

    // 3. Free User / Guest Limit Check (3 per day)
    const MAX_DAILY = PLANS.FREE.maxDailyConversions; // 3
    const ipAddress = getClientIp(request);

    let usage = null;
    if (user) {
      usage = await prisma.dailyUsage.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
      });
    } else {
      usage = await prisma.dailyUsage.findUnique({
        where: {
          ipAddress_date: {
            ipAddress,
            date: today,
          },
        },
      });
    }

    const currentCount = usage?.count || 0;

    if (currentCount >= MAX_DAILY) {
      return {
        allowed: false,
        isPro: false,
        planType: 'FREE',
        reason: 'DAILY_LIMIT_REACHED',
        maxAllowed: MAX_DAILY,
        remaining: 0,
        message: `Has alcanzado el límite diario gratuito (${MAX_DAILY} conversiones). Actualiza a Pro para conversiones ilimitadas.`,
      };
    }

    // Increment count
    if (user) {
      await prisma.dailyUsage.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        create: {
          userId: user.id,
          date: today,
          count: 1,
        },
        update: {
          count: { increment: 1 },
        },
      });

      await prisma.conversionRecord.create({
        data: {
          userId: user.id,
          fileName: 'documento',
          fileSize: fileSizeInBytes,
          conversionType: 'conversion',
        },
      });
    } else {
      await prisma.dailyUsage.upsert({
        where: {
          ipAddress_date: {
            ipAddress,
            date: today,
          },
        },
        create: {
          ipAddress,
          date: today,
          count: 1,
        },
        update: {
          count: { increment: 1 },
        },
      });
    }

    return {
      allowed: true,
      isPro: false,
      planType: 'FREE',
      remaining: MAX_DAILY - (currentCount + 1),
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    // Allow gracefully if DB error occurs so user experience is not completely blocked
    return {
      allowed: true,
      isPro: false,
      planType: 'FREE',
      remaining: 1,
    };
  }
}

export async function getUserStatus(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const today = getTodayDateString();

    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          stripeCurrentPeriodEnd: true,
        },
      });
    }

    const isPro = user?.planType === 'PRO_MONTHLY' || user?.planType === 'PRO_YEARLY';
    const planType = user?.planType || 'FREE';

    if (isPro) {
      return {
        isLoggedIn: true,
        isPro: true,
        planType,
        remaining: 'Ilimitado',
        user,
      };
    }

    const ipAddress = getClientIp(request);
    let usage = null;

    if (user) {
      usage = await prisma.dailyUsage.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });
    } else {
      usage = await prisma.dailyUsage.findUnique({
        where: { ipAddress_date: { ipAddress, date: today } },
      });
    }

    const count = usage?.count || 0;
    const max = PLANS.FREE.maxDailyConversions;

    return {
      isLoggedIn: !!user,
      isPro: false,
      planType: 'FREE',
      usedToday: count,
      maxAllowed: max,
      remaining: Math.max(0, max - count),
      user,
    };
  } catch (error) {
    return {
      isLoggedIn: false,
      isPro: false,
      planType: 'FREE',
      usedToday: 0,
      maxAllowed: 3,
      remaining: 3,
    };
  }
}
