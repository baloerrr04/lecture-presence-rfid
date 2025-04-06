// /app/api/socket/route.ts
import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types';
import { prisma } from '@/lib/db/prisma';

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket already running');
    res.end();
    return;
  }

  console.log('Setting up socket');
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle RFID scan event
    socket.on('rfid:scan', async (rfidId: string) => {
      try {
        // Find lecture by RFID
        const lecture = await prisma.lecture.findFirst({
          where: { rfid_id: rfidId }
        });

        if (!lecture) {
          socket.emit('rfid:error', 'RFID tidak terdaftar');
          return;
        }

        // Get current day of week (0-6, where 0 is Sunday)
        const dayOfWeek = new Date().getDay();
        // Map to our day names (adjust as needed based on your days naming)
        const dayMapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = dayMapping[dayOfWeek];

        // Find the day in our database
        const day = await prisma.day.findFirst({
          where: { name: dayName }
        });

        if (!day) {
          socket.emit('rfid:error', 'Hari tidak ditemukan di database');
          return;
        }

        // Check if lecture is scheduled for this day
        const lectureDay = await prisma.lectureDay.findUnique({
          where: {
            lecture_id_day_id: {
              lecture_id: lecture.id,
              day_id: day.id
            }
          }
        });

        if (!lectureDay) {
          socket.emit('rfid:error', 'Dosen tidak terjadwal pada hari ini');
          return;
        }

        // Check if presence already recorded today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingPresence = await prisma.presence.findFirst({
          where: {
            lecture_id: lecture.id,
            day_id: day.id,
            created_at: {
              gte: today,
              lt: tomorrow
            }
          }
        });

        if (existingPresence) {
          socket.emit('rfid:error', 'Kehadiran sudah tercatat hari ini');
          return;
        }

        // Record presence
        const presence = await prisma.presence.create({
          data: {
            lecture_id: lecture.id,
            day_id: day.id,
            status: 'hadir'
          }
        });

        // Broadcast the update to all clients
        io.emit('presence:update', {
          lecture,
          presence
        });

        socket.emit('rfid:success', {
          message: 'Kehadiran berhasil dicatat',
          lecture,
          presence
        });
        
      } catch (error) {
        console.error('RFID scan error:', error);
        socket.emit('rfid:error', 'Terjadi kesalahan saat memproses RFID');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  res.end();
}