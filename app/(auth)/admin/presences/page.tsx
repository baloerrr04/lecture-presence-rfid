"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Definisikan tipe data yang kompatibel dengan response dari server
interface LectureFromServer {
  id: string;
  name: string;
  rfid_id: string;
  code: string;
  photo: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

interface DayFromServer {
  id: string;
  name: string;
  created_at: string | Date;
  updated_at: string | Date;
}

interface PresenceFromServer {
  id: string;
  lecture_id: string;
  day_id: string;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
  lecture: LectureFromServer;
  day: DayFromServer;
}

export default function PresencesPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentPresence, setCurrentPresence] =
    useState<PresenceFromServer | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch presences for the selected date
  const { data: presences = [], refetch: refetchPresences } =
    trpc.presence.getByDate.useQuery(
      { date: selectedDate || new Date() },
      { enabled: !!selectedDate }
    );

  // Fetch all lectures for filter
  const { data: lectures = [] } = trpc.lecture.getAll.useQuery();

  // Update presence mutation
  const updatePresence = trpc.presence.update.useMutation({
    onSuccess: () => {
      toast.success("Status presensi berhasil diperbarui");
      refetchPresences();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Gagal memperbarui status presensi", {
        description: error.message,
      });
    },
  });

  // Delete presence mutation
  const deletePresence = trpc.presence.delete.useMutation({
    onSuccess: () => {
      toast.success("Presensi berhasil dihapus");
      refetchPresences();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Gagal menghapus presensi", {
        description: error.message,
      });
    },
  });

  // Filter presences based on selected lecture
  const filteredPresences = selectedLecture
    ? presences.filter((presence) => presence.lecture_id === selectedLecture)
    : presences;

  // Handle view presence
  const handleViewPresence = (presence: PresenceFromServer) => {
    setCurrentPresence(presence);
    setIsViewDialogOpen(true);
  };

  // Handle edit presence
  const handleEditPresence = (presence: PresenceFromServer) => {
    setCurrentPresence(presence);
    setNewStatus(presence.status);
    setIsEditDialogOpen(true);
  };

  // Handle delete presence
  const handleDeletePresence = (presence: PresenceFromServer) => {
    setCurrentPresence(presence);
    setIsDeleteDialogOpen(true);
  };

  // Handle update status
  const handleUpdateStatus = () => {
    if (currentPresence) {
      updatePresence.mutate({
        id: currentPresence.id,
        status: newStatus,
      });
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (currentPresence) {
      deletePresence.mutate({ id: currentPresence.id });
    }
  };

  // Reset filter
  const resetFilter = () => {
    setSelectedLecture(null);
    setIsFilterOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Riwayat Presensi</h1>
        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Presensi</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dosen</label>
                  <Select
                    value={selectedLecture || ""}
                    onValueChange={setSelectedLecture}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dosen" />
                    </SelectTrigger>
                    <SelectContent>
                      {lectures.map((lecture: LectureFromServer) => (
                        <SelectItem key={lecture.id} value={lecture.id}>
                          {lecture.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={resetFilter}>
                    Reset
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "PPP", { locale: id })
                  : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={() => refetchPresences()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Dosen</TableHead>
              <TableHead>Hari</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waktu Presensi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPresences.length > 0 ? (
              filteredPresences.map((presence: PresenceFromServer) => (
                <TableRow key={presence.id}>
                  <TableCell className="font-medium">
                    {presence.lecture.name}
                  </TableCell>
                  <TableCell>{presence.day.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        presence.status === "hadir"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {presence.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(presence.created_at),
                      "HH:mm:ss, dd MMM yyyy",
                      { locale: id }
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewPresence(presence)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPresence(presence)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePresence(presence)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  {selectedDate
                    ? "Tidak ada data presensi pada tanggal ini"
                    : "Pilih tanggal untuk melihat data presensi"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Presence Dialog */}
      {currentPresence && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detail Presensi</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Nama Dosen</div>
                <div className="col-span-2">{currentPresence.lecture.name}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Kode</div>
                <div className="col-span-2">{currentPresence.lecture.code}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">RFID ID</div>
                <div className="col-span-2">
                  {currentPresence.lecture.rfid_id}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Hari</div>
                <div className="col-span-2">{currentPresence.day.name}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Status</div>
                <div className="col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentPresence.status === "hadir"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentPresence.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Waktu Presensi</div>
                <div className="col-span-2">
                  {format(
                    new Date(currentPresence.created_at),
                    "HH:mm:ss, dd MMM yyyy",
                    { locale: id }
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Status Dialog */}
      {currentPresence && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Status Presensi</DialogTitle>
              <DialogDescription>
                Ubah status presensi {currentPresence.lecture.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hadir">Hadir</SelectItem>
                    <SelectItem value="tidak hadir">Tidak Hadir</SelectItem>
                    <SelectItem value="izin">Izin</SelectItem>
                    <SelectItem value="sakit">Sakit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={updatePresence.status === "pending"}
              >
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {currentPresence && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Presensi</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus data presensi{" "}
                {currentPresence.lecture.name} ini? Tindakan ini tidak dapat
                dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deletePresence.status === "pending"}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
