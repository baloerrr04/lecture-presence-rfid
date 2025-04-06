// /app/(auth)/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from '@/lib/trpc/client';
import { CalendarDays, Users, BookOpen, CheckCircle } from 'lucide-react';
import type { Presence } from '@prisma/client';
import type { Lecture } from '@prisma/client';

interface RecentScan {
  lecture: Lecture;
  presence: Presence;
}

export default function AdminDashboard() {
  // Get counts for dashboard stats
  const { data: lecturesCount = 0 } = trpc.lecture.getCount.useQuery();
  const { data: daysCount = 0 } = trpc.day.getCount.useQuery();
  const { data: presencesCount = 0 } = trpc.presence.getCount.useQuery();
  const { data: todayPresences = 0 } = trpc.presence.getTodayCount.useQuery();
  
  // Get recent presences instead of using socket
  const { data: recentPresences = [] } = trpc.presence.getRecent.useQuery({ limit: 5 });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dosen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{lecturesCount}</div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{daysCount}</div>
              <CalendarDays className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Presensi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{presencesCount}</div>
              <BookOpen className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Presensi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{todayPresences}</div>
              <CheckCircle className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Presensi terbaru yang tercatat</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPresences.length > 0 ? (
              <ul className="space-y-2">
                {recentPresences.map((presence) => (
                  <li key={presence.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">{presence.lecture.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(presence.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {presence.status}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Belum ada aktivitas presensi terbaru</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}