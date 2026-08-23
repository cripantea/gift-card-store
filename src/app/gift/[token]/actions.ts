"use server";

import { prisma } from "@/lib/prisma";

export async function markGiftCardAsOpened(secretToken: string): Promise<void> {
  await prisma.giftCard.updateMany({
    where: { secretToken, isOpened: false },
    data: { isOpened: true },
  });
}
