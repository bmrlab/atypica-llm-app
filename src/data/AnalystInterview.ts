"use server";
import { prisma } from "@/lib/prisma";
import { AnalystInterview as AnalystInterviewPrisma } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { Message } from "ai";
import { forbidden, notFound } from "next/navigation";
import { Analyst } from "./Analyst";
import { Persona } from "./Persona";
import withAuth from "./withAuth";

export type AnalystInterview = Omit<AnalystInterviewPrisma, "messages"> & {
  messages: Message[];
};

export async function fetchAnalystInterviews(
  analystId: number,
): Promise<(AnalystInterview & { persona: Persona })[]> {
  return withAuth(async () => {
    // @AUTHTODO: 读取 AnalystInterview 暂时不需要 user 有 Analyst 权限
    // const userAnalyst = await prisma.userAnalyst.findUnique({
    //   where: { userId_analystId: { userId: user.id, analystId } },
    // });
    // if (!userAnalyst) forbidden();
    const interviews = await prisma.analystInterview.findMany({
      where: { analystId },
      include: {
        persona: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return interviews.map((interview) => {
      const { persona, messages } = interview;
      return {
        ...interview,
        persona: {
          ...persona,
          tags: persona.tags as string[],
        },
        messages: messages as unknown as Message[],
      };
    });
  });
}

export async function fetchInterviewByAnalystAndPersona({
  analystId,
  personaId,
}: {
  analystId: number;
  personaId: number;
}): Promise<
  AnalystInterview & {
    persona: Persona & {
      tags: string[];
    };
    analyst: Analyst;
  }
> {
  // @AUTHTODO: 读取 AnalystInterview 暂时不需要 user 有 Analyst 权限
  // return withAuth(async () => {
  try {
    const interview = await prisma.analystInterview.findUniqueOrThrow({
      where: {
        analystId_personaId: { analystId, personaId },
      },
      include: {
        persona: true,
        analyst: true,
      },
    });
    if (!interview) notFound();
    // const userAnalyst = await prisma.userAnalyst.findUnique({
    //   where: {
    //     userId_analystId: { userId: user.id, analystId: interview.analystId },
    //   },
    // });
    // if (!userAnalyst) forbidden();
    const { messages } = interview;
    return {
      ...interview,
      persona: {
        ...interview.persona,
        tags: interview.persona.tags as string[],
      },
      messages: messages as unknown as Message[],
    };
  } catch (error) {
    console.log("Error fetching analyst interview", error);
    throw error;
  }
  // });
}

export async function fetchAnalystInterviewById(interviewId: number): Promise<AnalystInterview> {
  return withAuth(async () => {
    try {
      const interview = await prisma.analystInterview.findUnique({
        where: { id: interviewId },
      });
      if (!interview) notFound();
      // @AUTHTODO: 读取 AnalystInterview 暂时不需要 user 有 Analyst 权限
      // const userAnalyst = await prisma.userAnalyst.findUnique({
      //   where: {
      //     userId_analystId: { userId: user.id, analystId: interview.analystId },
      //   },
      // });
      // if (!userAnalyst) forbidden();
      const { messages } = interview;
      return {
        ...interview,
        messages: messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error fetching analyst interview", error);
      throw error;
    }
  });
}

export async function upsertAnalystInterview({
  analystId,
  personaId,
}: {
  analystId: number;
  personaId: number;
}): Promise<AnalystInterview> {
  return withAuth(async (user) => {
    try {
      // @AUTHTODO: 创建 AnalystInterview 依然需要 user 有 Analyst 权限
      const userAnalyst = await prisma.userAnalyst.findUnique({
        where: { userId_analystId: { userId: user.id, analystId } },
      });
      if (!userAnalyst) forbidden();
      const interview = await prisma.analystInterview.upsert({
        where: {
          analystId_personaId: {
            analystId,
            personaId,
          },
        },
        update: {},
        create: {
          analystId,
          personaId,
          personaPrompt: "",
          interviewerPrompt: "",
          messages: [],
          conclusion: "",
        },
      });
      return {
        ...interview,
        messages: interview.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Interview already exists", error);
      throw error;
    }
  });
}

export async function updateAnalystInterview(
  analystInterviewId: number,
  {
    messages,
    conclusion,
  }: Partial<{
    messages: Message[];
    conclusion: string;
  }>,
): Promise<AnalystInterview> {
  try {
    const updatedInterview = await prisma.analystInterview.update({
      where: { id: analystInterviewId },
      data: {
        conclusion,
        messages: messages ? (messages as unknown as InputJsonValue) : undefined,
      },
    });
    return {
      ...updatedInterview,
      messages: updatedInterview.messages as unknown as Message[],
    };
  } catch (error) {
    console.log("Failed to update interview", error);
    throw error;
  }
}
