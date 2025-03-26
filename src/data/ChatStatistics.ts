"use server";
import { prisma } from "@/lib/prisma";
import { ChatStatistics as ChatStatisticsPrisma } from "@prisma/client";

export type ChatStatistics = ChatStatisticsPrisma & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra: any;
};

export async function fetchStatsByStudyUserChatId(studyUserChatId: number) {
  const result = await prisma.chatStatistics.groupBy({
    by: ["dimension"],
    where: {
      userChatId: studyUserChatId,
    },
    _sum: {
      value: true,
    },
  });

  return result.map((item) => ({
    dimension: item.dimension,
    total: item._sum.value,
  }));
}
