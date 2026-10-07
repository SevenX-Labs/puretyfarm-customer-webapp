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
          gender: user.gender,
          dob: user.dob,
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
    const { name, email, avatarUrl, gender, dob } = body;

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

    const VALID_GENDERS = ["male", "female", "other"];
    if (gender !== undefined) {
      if (typeof gender !== "string") {
        return NextResponse.json(
          { success: false, error: "Gender must be a valid string." },
          { status: 400 }
        );
      }
      const trimmedGender = gender.trim().toLowerCase();
      if (trimmedGender !== "" && !VALID_GENDERS.includes(trimmedGender)) {
        return NextResponse.json(
          { success: false, error: "Unsupported gender value. Choose male, female, or other." },
          { status: 400 }
        );
      }
    }

    if (dob !== undefined) {
      if (typeof dob !== "string") {
        return NextResponse.json(
          { success: false, error: "Date of birth must be a valid string." },
          { status: 400 }
        );
      }
      const trimmedDob = dob.trim();
      if (trimmedDob !== "") {
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(trimmedDob)) {
          return NextResponse.json(
            { success: false, error: "Please enter date of birth in YYYY-MM-DD format." },
            { status: 400 }
          );
        }

        const [yearStr, monthStr, dayStr] = trimmedDob.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        const day = Number(dayStr);

        const dateObj = new Date(Date.UTC(year, month - 1, day));
        if (
          dateObj.getUTCFullYear() !== year ||
          dateObj.getUTCMonth() !== month - 1 ||
          dateObj.getUTCDate() !== day
        ) {
          return NextResponse.json(
            { success: false, error: "Please enter a valid calendar date." },
            { status: 400 }
          );
        }

        const now = new Date();
        const todayUtcStr = now.toISOString().split("T")[0];
        if (trimmedDob > todayUtcStr) {
          return NextResponse.json(
            { success: false, error: "Date of birth cannot be in the future." },
            { status: 400 }
          );
        }
      }
    }

    const genderToSave = gender !== undefined ? gender.trim().toLowerCase() : undefined;
    const dobToSave = dob !== undefined ? dob.trim() : undefined;

    let userRecord = await db.updateUser(session.userId, {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(email !== undefined ? { email: email.trim() } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(genderToSave !== undefined ? { gender: genderToSave } : {}),
      ...(dobToSave !== undefined ? { dob: dobToSave } : {}),
    });

    if (!userRecord) {
      // Auto-heal missing user record in serverless environments
      userRecord = await db.createUser({
        id: session.userId,
        phone: session.phone || "+919876543210",
        name: (name && typeof name === "string" && name.trim()) ? name.trim() : "Customer",
        email: (email && typeof email === "string") ? email.trim() : "",
        avatarUrl: typeof avatarUrl === "string" ? avatarUrl : "",
        gender: genderToSave,
        dob: dobToSave,
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
        gender: userRecord.gender,
        dob: userRecord.dob,
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
