"use server";
import { prisma } from "@/lib/prisma";
import { forbidden, notFound } from "next/navigation";
import { Analyst as AnalystPrisma } from "@prisma/client";
import withAuth from "./withAuth";

export type Analyst = AnalystPrisma;

export async function fetchAnalysts() {
  return withAuth(async (user) => {
    const analysts = await prisma.analyst.findMany({
      where: {
        userAnalysts: {
          some: {
            userId: user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return analysts.map((analyst) => {
      return { ...analyst };
    });
  });
}

export async function fetchAnalystById(analystId: number): Promise<Analyst> {
  return withAuth(async (user) => {
    try {
      const userAnalyst = await prisma.userAnalyst.findUnique({
        where: { userId_analystId: { userId: user.id, analystId } },
      });
      if (!userAnalyst) forbidden();
      const analyst = await prisma.analyst.findUnique({
        where: { id: analystId },
      });
      if (!analyst) notFound();
      return { ...analyst };
    } catch (error) {
      console.log("Error fetching analyst:", error);
      throw error;
    }
  });
}

export async function createAnalyst({
  role,
  topic,
}: Pick<Analyst, "role" | "topic">): Promise<Analyst> {
  return withAuth(async (user) => {
    try {
      const analyst = await prisma.analyst.create({
        // Empty report for new analysts
        data: { role, topic, report: "" },
      });
      await prisma.userAnalyst.create({
        data: {
          userId: user.id,
          analystId: analyst.id,
        },
      });
      return analyst;
    } catch (error) {
      console.log("Error creating analyst:", error);
      throw error;
    }
  });
}

export async function updateAnalyst(
  analystId: number,
  { role, topic, report }: Partial<Pick<Analyst, "role" | "topic" | "report">>,
): Promise<Analyst> {
  return withAuth(async (user) => {
    try {
      const userAnalyst = await prisma.userAnalyst.findUnique({
        where: { userId_analystId: { userId: user.id, analystId } },
      });
      if (!userAnalyst) forbidden();
      const data: Partial<Pick<Analyst, "role" | "topic" | "report">> = {};
      if (typeof role !== "undefined") data.role = role;
      if (typeof topic !== "undefined") data.topic = topic;
      if (typeof report !== "undefined") data.report = report;
      const analyst = await prisma.analyst.update({
        where: { id: analystId },
        data,
      });
      return analyst;
    } catch (error) {
      console.log("Error updating analyst:", error);
      throw error;
    }
  });
}
