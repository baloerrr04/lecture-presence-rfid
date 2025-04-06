// /app/(auth)/admin/lectures/page.tsx
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Definisikan tipe data yang kompatibel dengan response dari server
interface DayFromServer {
  id: string;
  name: string;
  created_at: string | Date;
  updated_at: string | Date;
}

interface LectureDayFromServer {
  lecture_id: string;
  day_id: string;
  created_at: string | Date;
  updated_at: string | Date;
  day: DayFromServer;
}

interface LectureFromServer {
  id: string;
  name: string;
  rfid_id: string;
  code: string;
  photo: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  day: LectureDayFromServer[];
}

interface FormData {
  name: string;
  rfid_id: string;
  code: string;
  photo: string;
  dayIds: string[];
}

export default function LecturesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedLecture, setSelectedLecture] =
    useState<LectureFromServer | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    rfid_id: "",
    code: "",
    photo: "",
    dayIds: [],
  });

  // Fetch lectures
  const { data: lectures = [], refetch: refetchLectures } =
    trpc.lecture.getAll.useQuery();

  // Fetch days for checkboxes
  const { data: days = [] } = trpc.day.getAll.useQuery();

  // Create mutation
  const createLecture = trpc.lecture.create.useMutation({
    onSuccess: () => {
      toast.success("Dosen berhasil ditambahkan");
      refetchLectures();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal menambahkan dosen", {
        description: error.message,
      });
    },
  });

  // Update mutation
  const updateLecture = trpc.lecture.update.useMutation({
    onSuccess: () => {
      toast.success("Dosen berhasil diperbarui");
      refetchLectures();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal memperbarui dosen", {
        description: error.message,
      });
    },
  });

  // Delete mutation
  const deleteLecture = trpc.lecture.delete.useMutation({
    onSuccess: () => {
      toast.success("Dosen berhasil dihapus");
      refetchLectures();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Gagal menghapus dosen", {
        description: error.message,
      });
    },
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleDayChange = (dayId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, dayIds: [...prev.dayIds, dayId] };
      } else {
        return { ...prev, dayIds: prev.dayIds.filter((id) => id !== dayId) };
      }
    });
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formMode === "create") {
      createLecture.mutate(formData);
    } else {
      if (selectedLecture) {
        updateLecture.mutate({ id: selectedLecture.id, ...formData });
      }
    }
  };

  // Handle edit
  const handleEdit = (lecture: LectureFromServer) => {
    setFormMode("edit");
    setSelectedLecture(lecture);

    // Get the day IDs for this lecture
    const lectureDayIds = lecture.day.map((d) => d.day_id);

    setFormData({
      name: lecture.name,
      rfid_id: lecture.rfid_id,
      code: lecture.code,
      photo: lecture.photo || "",
      dayIds: lectureDayIds,
    });

    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (lecture: LectureFromServer) => {
    setSelectedLecture(lecture);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedLecture) {
      deleteLecture.mutate({ id: selectedLecture.id });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      rfid_id: "",
      code: "",
      photo: "",
      dayIds: [],
    });
    setSelectedLecture(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setFormMode("create");
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Dosen</h1>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Dosen
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>RFID ID</TableHead>
              <TableHead>Hari Mengajar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lectures.length > 0 ? (
              lectures.map((lecture: LectureFromServer) => (
                <TableRow key={lecture.id}>
                  <TableCell className="font-medium">{lecture.name}</TableCell>
                  <TableCell>{lecture.code}</TableCell>
                  <TableCell>{lecture.rfid_id}</TableCell>
                  <TableCell>
                    {lecture.day &&
                      lecture.day.map((d) => d.day.name).join(", ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(lecture)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(lecture)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Belum ada data dosen
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Tambah Dosen Baru" : "Edit Dosen"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Tambahkan data dosen baru ke dalam sistem"
                : "Perbarui data dosen yang sudah ada"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rfid_id" className="text-right">
                  RFID ID
                </Label>
                <Input
                  id="rfid_id"
                  name="rfid_id"
                  value={formData.rfid_id}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Kode
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photo" className="text-right">
                  URL Foto
                </Label>
                <Input
                  id="photo"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Opsional"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Hari Mengajar</Label>
                <div className="col-span-3 space-y-2">
                  {days.map((day: DayFromServer) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.id}`}
                        checked={formData.dayIds.includes(day.id)}
                        onCheckedChange={(checked) =>
                          handleDayChange(day.id, checked === true)
                        }
                      />
                      <Label htmlFor={`day-${day.id}`}>{day.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  createLecture.status === "pending" ||
                  updateLecture.status === "pending"
                }
              >
                {formMode === "create" ? "Tambahkan" : "Perbarui"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Dosen</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus dosen{" "}
              <strong>{selectedLecture?.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLecture.status === "pending"}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
