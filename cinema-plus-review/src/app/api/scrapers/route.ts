import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { runScraper, getAvailableSites } from "@/lib/scrapers";
import { hash, compare } from "bcryptjs";

// GET /api/scrapers?type=stats|logs|links
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "stats";

  try {
    switch (type) {
      case "stats": {
        const [totalLogs, successLogs, recentLogs] = await Promise.all([
          db.scraperLog.count(),
          db.scraperLog.count({ where: { status: "success" } }),
          db.scraperLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
          }),
        ]);

        const totalLinks = await db.scraperLog.aggregate({
          _sum: { linksCount: true },
        });

        return NextResponse.json({
          totalMovies: successLogs,
          totalSeries: totalLogs - successLogs,
          totalLinks: totalLinks._sum.linksCount || 0,
          recentScrapes: recentLogs.length,
        });
      }

      case "logs": {
        const limit = parseInt(searchParams.get("limit") || "20");
        const logs = await db.scraperLog.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        return NextResponse.json({ logs });
      }

      case "links": {
        const logs = await db.scraperLog.findMany({
          where: { status: "success", linksCount: { gt: 0 } },
          orderBy: { createdAt: "desc" },
          take: 100,
        });
        const links = logs.map((log) => ({
          id: log.id,
          title: `${log.site} - ${log.message || "محتوى"}`,
          url: "#",
          quality: "720p",
          site: log.site,
          type: "movie",
          createdAt: log.createdAt.toISOString(),
        }));
        return NextResponse.json({ links });
      }

      case "sites": {
        const sites = getAvailableSites();
        return NextResponse.json({ sites });
      }

      default:
        return NextResponse.json(
          { error: "نوع غير معروف" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "خطأ في قاعدة البيانات" },
      { status: 500 }
    );
  }
}

// POST /api/scrapers - Run a scraper
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { site } = body;

    if (!site) {
      return NextResponse.json(
        { error: "يرجى تحديد الموقع" },
        { status: 400 }
      );
    }

    // Create a log entry as "running"
    const log = await db.scraperLog.create({
      data: {
        site,
        status: "running",
        linksCount: 0,
        message: "بدأ استخراج المحتوى...",
      },
    });

    try {
      const result = await runScraper(site);

      // Update log with results
      const updatedLog = await db.scraperLog.update({
        where: { id: log.id },
        data: {
          status: result.success ? "success" : "error",
          linksCount: result.totalLinks,
          message: result.success
            ? `تم استخراج ${result.movies.length} عنصر و ${result.totalLinks} رابط`
            : result.errors.join(", "),
        },
      });

      return NextResponse.json({
        success: result.success,
        movies: result.movies,
        log: {
          id: updatedLog.id,
          site: updatedLog.site,
          status: updatedLog.status,
          linksCount: updatedLog.linksCount,
          message: updatedLog.message,
          createdAt: updatedLog.createdAt.toISOString(),
        },
      });
    } catch (error) {
      // Update log with error
      await db.scraperLog.update({
        where: { id: log.id },
        data: {
          status: "error",
          message: `خطأ: ${error instanceof Error ? error.message : String(error)}`,
        },
      });

      return NextResponse.json(
        { error: "فشل في استخراج المحتوى" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "خطأ في الطلب" },
      { status: 400 }
    );
  }
}

// PUT /api/scrapers?type=settings - Update credentials
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "settings") {
    try {
      const body = await request.json();
      const { currentPassword, newUsername, newPassword } = body;

      // Get current admin
      const admin = await db.admin.findFirst();
      if (!admin) {
        return NextResponse.json(
          { error: "لا يوجد حساب مدير" },
          { status: 404 }
        );
      }

      // Verify current password
      const isValid = await compare(currentPassword, admin.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "كلمة المرور الحالية غير صحيحة" },
          { status: 401 }
        );
      }

      // Update credentials
      const updateData: { username?: string; password?: string } = {};
      if (newUsername) updateData.username = newUsername;
      if (newPassword) updateData.password = await hash(newPassword, 12);

      await db.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: "خطأ في تحديث البيانات" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "نوع غير معروف" }, { status: 400 });
}

// DELETE /api/scrapers?type=clear|reset-db
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    switch (type) {
      case "clear":
        await db.scraperLog.deleteMany();
        return NextResponse.json({ success: true });
      case "reset-db":
        await db.scraperLog.deleteMany();
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json(
          { error: "نوع غير معروف" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "خطأ في قاعدة البيانات" },
      { status: 500 }
    );
  }
}
