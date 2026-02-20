import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

const SETTINGS_DOC_ID = 'company-settings';

// GET - Get company settings
export async function GET() {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const doc = await db.collection('settings').doc(SETTINGS_DOC_ID).get();

    if (!doc.exists) {
      // Return default settings
      return NextResponse.json({
        settings: getDefaultSettings(),
      });
    }

    const data = doc.data();
    return NextResponse.json({
      settings: {
        ...data,
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Save company settings
export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const db = getAdminDb();

    const settings = {
      ...body,
      updatedAt: Timestamp.now(),
      updatedBy: user.email || user.uid,
    };

    await db.collection('settings').doc(SETTINGS_DOC_ID).set(settings, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving company settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

function getDefaultSettings() {
  return {
    company: {
      name: 'Mad Masters',
      legalName: 'Mad Masters Web Studio',
      tagline: 'We build digital products that matter',
      description: 'Full-service web development studio specializing in modern web applications, mobile apps, and digital products.',
      founded: '2024',
      website: 'https://madmasters.io',
      email: 'madmweb@gmail.com',
      phone: '',
      address: '',
    },
    project: {
      name: 'Mad Masters Website',
      repository: 'https://github.com/madmasters/madmasters',
      stack: {
        framework: 'Next.js 14 (App Router)',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        database: 'Firebase Firestore',
        auth: 'Firebase Auth',
        hosting: 'Vercel',
        storage: 'Firebase Storage',
      },
      features: [
        'Portfolio showcase',
        'Case studies',
        'Contact forms',
        'Admin panel',
        'Projects knowledge base',
        'Social links management',
      ],
    },
    integrations: {
      telegram: {
        enabled: true,
        botUsername: '@Madmasters_bot',
        botName: 'Madmasters',
        chatId: '422169009',
        description: 'Receives notifications for contact form submissions',
      },
      firebase: {
        enabled: true,
        projectId: 'madmasters-pro',
        services: ['Authentication', 'Firestore', 'Storage'],
      },
      vercel: {
        enabled: true,
        projectName: 'madmasters',
        description: 'Hosting and deployment',
      },
      github: {
        enabled: false,
        description: 'Fresh Works integration for showing recent activity',
      },
      appStore: {
        enabled: false,
        description: 'Fresh Works integration for showing app metrics',
      },
    },
    seo: {
      defaultTitle: 'Mad Masters - Web Development Studio',
      defaultDescription: 'We build digital products that matter. Full-service web development studio.',
      ogImage: '/og-image.png',
      twitterHandle: '',
    },
    updatedAt: null,
    updatedBy: null,
  };
}
