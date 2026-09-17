import 'dotenv/config';

import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { prisma } from './lib/prisma';
import { requireAuth, requireRole, type AuthRequest } from './middleware/auth';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const JWT_SECRET = process.env.JWT_SECRET ?? 'eventhub-dev-secret';

app.use(cors());
app.use(express.json());

const userPayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ORGANIZER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const eventSchema = z.object({
  name: z.string().min(2),
  image: z.string().min(1),
  description: z.string().min(10),
  date: z.string().min(1),
  time: z.string().min(1),
  location: z.string().min(2),
  category: z.string().min(2),
  price: z.number().min(0),
  totalSeats: z.number().int().min(1),
  availableSeats: z.number().int().min(0).optional(),
});

const bookingSchema = z.object({
  eventId: z.string().min(1),
  numberOfSeats: z.number().int().min(1),
});

const sanitizeUser = (user: { id: string; name: string; email: string; role: 'USER' | 'ORGANIZER'; phone: string | null; createdAt: Date; updatedAt: Date; }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (user: { id: string; email: string; role: 'USER' | 'ORGANIZER' }) => {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

const getParamId = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
};

const seedDatabase = async (): Promise<void> => {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return;
  }

  const organizerPassword = await bcrypt.hash('Organizer123', 10);
  const userPassword = await bcrypt.hash('User12345', 10);

  const organizer = await prisma.user.create({
    data: {
      name: 'Aisha Organizer',
      email: 'organizer@eventhub.com',
      passwordHash: organizerPassword,
      role: 'ORGANIZER',
      phone: '+94770000001',
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: 'Sam User',
      email: 'user@eventhub.com',
      passwordHash: userPassword,
      role: 'USER',
      phone: '+94770000002',
    },
  });

  await prisma.event.createMany({
    data: [
      {
        organizerId: organizer.id,
        name: 'Sunset Music Night',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        description: 'An open-air music festival featuring local DJs, food stalls and a sunset lounge.',
        date: '2026-10-05',
        time: '18:30',
        location: 'Galle Face Green',
        category: 'Music',
        price: 1800,
        totalSeats: 120,
        availableSeats: 120,
      },
      {
        organizerId: organizer.id,
        name: 'Startup Networking Mixer',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        description: 'Meet founders, investors, creators and partners for a relaxed evening of collaboration.',
        date: '2026-10-09',
        time: '19:00',
        location: 'Colombo Innovation Hub',
        category: 'Business',
        price: 2500,
        totalSeats: 80,
        availableSeats: 80,
      },
      {
        organizerId: organizer.id,
        name: 'Creative Art Walk',
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
        description: 'Explore murals, local craft makers and interactive art sessions in the city center.',
        date: '2026-10-15',
        time: '10:00',
        location: 'Bambalapitiya Arts District',
        category: 'Arts',
        price: 1200,
        totalSeats: 60,
        availableSeats: 60,
      },
    ],
  });

  await prisma.booking.create({
    data: {
      userId: regularUser.id,
      eventId: (await prisma.event.findFirst({ where: { name: 'Sunset Music Night' } }))!.id,
      numberOfSeats: 2,
      totalAmount: 3600,
      status: 'CONFIRMED',
    },
  });

  const event = await prisma.event.findFirst({ where: { name: 'Sunset Music Night' } });
  if (event) {
    await prisma.event.update({
      where: { id: event.id },
      data: { availableSeats: event.availableSeats - 2 },
    });
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'EventHub API is running.' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const payload = userPayloadSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        passwordHash,
        phone: payload.phone ?? null,
        role: payload.role ?? 'USER',
      },
    });

    return res.status(201).json({
      token: signToken({ id: user.id, email: user.email, role: user.role }),
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return res.status(400).json({
        message: firstIssue?.message ?? 'Please check your registration details.',
      });
    }

    return res.status(400).json({ message: 'Please provide valid registration details.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      token: signToken({ id: user.id, email: user.email, role: user.role }),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(400).json({ message: 'Please provide a valid email and password.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ user: { id: req.user!.id, email: req.user!.email, role: req.user!.role } });
});

app.get('/api/users/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: sanitizeUser(user) });
});

app.put('/api/users/me', requireAuth, async (req: AuthRequest, res) => {
  const payload = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
  }).parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone || null } : {}),
    },
  });

  res.json({ user: sanitizeUser(user) });
});

app.get('/api/events', async (_req, res) => {
  const events = await prisma.event.findMany({
    include: { organizer: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ events });
});

app.get('/api/events/:id', async (req, res) => {
  const eventId = getParamId(req.params.id);
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true },
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  return res.json({ event });
});

app.post('/api/events', requireAuth, requireRole('ORGANIZER'), async (req: AuthRequest, res) => {
  try {
    const payload = eventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        organizerId: req.user!.id,
        name: payload.name,
        image: payload.image,
        description: payload.description,
        date: payload.date,
        time: payload.time,
        location: payload.location,
        category: payload.category,
        price: payload.price,
        totalSeats: payload.totalSeats,
        availableSeats: payload.availableSeats ?? payload.totalSeats,
      },
      include: { organizer: true },
    });

    return res.status(201).json({ event });
  } catch (error) {
    return res.status(400).json({ message: 'Please provide valid event data.' });
  }
});

app.put('/api/events/:id', requireAuth, requireRole('ORGANIZER'), async (req: AuthRequest, res) => {
  try {
    const payload = eventSchema.partial().parse(req.body);
    const eventId = getParamId(req.params.id);
    const existing = await prisma.event.findUnique({ where: { id: eventId } });

    if (!existing || existing.organizerId !== req.user!.id) {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.image ? { image: payload.image } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.date ? { date: payload.date } : {}),
        ...(payload.time ? { time: payload.time } : {}),
        ...(payload.location ? { location: payload.location } : {}),
        ...(payload.category ? { category: payload.category } : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.totalSeats !== undefined ? { totalSeats: payload.totalSeats } : {}),
        ...(payload.availableSeats !== undefined ? { availableSeats: payload.availableSeats } : {}),
      },
      include: { organizer: true },
    });

    return res.json({ event });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid event update payload.' });
  }
});

app.delete('/api/events/:id', requireAuth, requireRole('ORGANIZER'), async (req: AuthRequest, res) => {
  const eventId = getParamId(req.params.id);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.organizerId !== req.user!.id) {
    return res.status(403).json({ message: 'You can only delete your own events.' });
  }

  await prisma.booking.deleteMany({ where: { eventId } });
  await prisma.event.delete({ where: { id: eventId } });

  return res.status(204).send();
});

app.post('/api/bookings', requireAuth, requireRole('USER'), async (req: AuthRequest, res) => {
  try {
    const payload = bookingSchema.parse(req.body);
    const event = await prisma.event.findUnique({ where: { id: payload.eventId } });

    if (!event) {
      return res.status(404).json({ message: 'The selected event does not exist.' });
    }

    if (payload.numberOfSeats <= 0 || payload.numberOfSeats > event.availableSeats) {
      return res.status(400).json({ message: 'Requested seats are not available.' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        eventId: event.id,
        numberOfSeats: payload.numberOfSeats,
        totalAmount: event.price * payload.numberOfSeats,
        status: 'CONFIRMED',
      },
      include: { event: true },
    });

    await prisma.event.update({
      where: { id: event.id },
      data: { availableSeats: event.availableSeats - payload.numberOfSeats },
    });

    return res.status(201).json({ booking });
  } catch (error) {
    return res.status(400).json({ message: 'Booking could not be created.' });
  }
});

app.get('/api/bookings/my', requireAuth, requireRole('USER'), async (req: AuthRequest, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.id },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ bookings });
});

app.patch('/api/bookings/:id/cancel', requireAuth, async (req: AuthRequest, res) => {
  const bookingId = getParamId(req.params.id);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true },
  });

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  const isOwner = booking.userId === req.user!.id || req.user!.role === 'ORGANIZER';
  if (!isOwner) {
    return res.status(403).json({ message: 'You cannot cancel this booking.' });
  }

  if (booking.status !== 'CONFIRMED') {
    return res.status(400).json({ message: 'Only confirmed bookings can be cancelled.' });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  });

  await prisma.event.update({
    where: { id: booking.eventId },
    data: { availableSeats: booking.event.availableSeats + booking.numberOfSeats },
  });

  return res.json({ booking: updatedBooking });
});

app.get('/api/organizer/events', requireAuth, requireRole('ORGANIZER'), async (req: AuthRequest, res) => {
  const events = await prisma.event.findMany({
    where: { organizerId: req.user!.id },
    include: { organizer: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ events });
});

app.get('/api/organizer/events/:id/bookings', requireAuth, requireRole('ORGANIZER'), async (req: AuthRequest, res) => {
  const eventId = getParamId(req.params.id);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.organizerId !== req.user!.id) {
    return res.status(403).json({ message: 'You can only view bookings for your own events.' });
  }

  const bookings = await prisma.booking.findMany({
    where: { eventId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ bookings });
});

async function startServer() {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`EventHub API is listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start EventHub API:', error);
  process.exit(1);
});
