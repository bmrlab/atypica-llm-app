"use server";
import { prisma } from "@/lib/prisma";
import { AnalystReport as AnalystReportPrisma } from "@prisma/client";
import { forbidden, notFound } from "next/navigation";
import withAuth from "./withAuth";

export type AnalystReport = AnalystReportPrisma;

export async function fetchPendingReportByAnalystId(analystId: number) {
  const report = await prisma.analystReport.findFirst({
    where: {
      analystId,
      generatedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!report) notFound();
  return report as AnalystReport;
}

// @TODO[LEGACY] For legacy analystReport tool, without reportId in toolInvocation.result
// 历史的 analyst.report 会迁移到 AnalystReport，所以一定是第一个 report
export async function fetchFirstReportByAnalystId(analystId: number) {
  return withAuth(async (user) => {
    const userAnalyst = await prisma.userAnalyst.findUnique({
      where: {
        userId_analystId: { userId: user.id, analystId },
      },
    });
    if (!userAnalyst) forbidden();
    const report = await prisma.analystReport.findFirst({
      where: { analystId },
      orderBy: { createdAt: "asc" },
    });
    if (!report) notFound();
    return report as AnalystReport;
  });
}

export async function fetchAnalystReportById(id: number) {
  // @TODO[AUTH]: 读取 AnalystReport 暂时不需要 user 有 AnalystReport 权限
  // return withAuth(async (user) => {
  const report = await prisma.analystReport.findUnique({
    where: { id },
  });
  if (!report) notFound();
  // const userAnalyst = await prisma.userAnalyst.findUnique({
  //   where: {
  //     userId_analystId: { userId: user.id, analystId: report.analystId },
  //   },
  // });
  // if (!userAnalyst) forbidden();
  return report as AnalystReport;
  // });
}

export async function fetchAnalystReportByToken(token: string) {
  const report = await prisma.analystReport.findUnique({
    where: {
      token,
    },
  });
  if (!report) notFound();
  return report as AnalystReport;
}
