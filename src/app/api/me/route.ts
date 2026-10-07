import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentSession,
  createSessionToken,
  getSessionCookieOptions,
} from "@/server/auth/session";
import { db } from "@/server/db/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: true, authenticated: false, user: null },
        { status: 200 }
      );
    }

    let user = await db.getUserById(session.userId);
    if (!user) {
      // Auto-heal missing user record in serverless environments
      user = await db.createUser({
        id: session.userId,
        phone: session.phone || "+919876543210",
        name: session.name || "Customer",
      });
    }

    const onboardingStep = await db.getUserOnboardingStatus(session.userId);

    return NextResponse.json(
      {
        success: true,
        onboardingStep,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("[me GET error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, avatarUrl } = body;

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json(
        { success: false, error: "Full name cannot be empty." },
        { status: 400 }
      );
    }

    if (email !== undefined && email !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
    }

    let userRecord = await db.updateUser(session.userId, {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(email !== undefined ? { email: email.trim() } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    });

    if (!userRecord) {
      // Auto-heal missing user record in serverless environments
      userRecord = await db.createUser({
        id: session.userId,
        phone: session.phone || "+919876543210",
        name: (name && typeof name === "string" && name.trim()) ? name.trim() : "Customer",
        email: (email && typeof email === "string") ? email.trim() : "",
        avatarUrl: typeof avatarUrl === "string" ? avatarUrl : "",
      });
    }

    const onboardingStep = await db.getUserOnboardingStatus(session.userId);

    // Re-issue session cookie with updated name so auto-heal on other
    // serverless instances uses the current name instead of the stale one
    const newToken = await createSessionToken(userRecord);
    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      onboardingStep,
      user: {
        id: userRecord.id,
        phone: userRecord.phone,
        name: userRecord.name,
        email: userRecord.email,
        avatarUrl: userRecord.avatarUrl,
        createdAt: userRecord.createdAt,
      },
    });

    response.cookies.set(cookieOpts.name, newToken, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (err) {
    console.error("[me PATCH error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
