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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Definisikan tipe yang kompatibel dengan data dari server
interface DayFromServer {
  id: string;
  name: string;
  created_at: string | Date;
  updated_at: string | Date;
}

interface FormData {
  name: string;
}

export default function DaysPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedDay, setSelectedDay] = useState<DayFromServer | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: "" });

  // Fetch days
  const { data: days = [], refetch: refetchDays } = trpc.day.getAll.useQuery();

  // Create mutation
  const createDay = trpc.day.create.useMutation({
    onSuccess: () => {
      toast.success("Hari berhasil ditambahkan");
      refetchDays();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal menambahkan hari", {
        description: error.message,
      });
    },
  });

  // Update mutation
  const updateDay = trpc.day.update.useMutation({
    onSuccess: () => {
      toast.success("Hari berhasil diperbarui");
      refetchDays();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal memperbarui hari", {
        description: error.message,
      });
    },
  });

  // Delete mutation
  const deleteDay = trpc.day.delete.useMutation({
    onSuccess: () => {
      toast.success("Hari berhasil dihapus");
      refetchDays();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Gagal menghapus hari", {
        description: error.message,
      });
    },
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formMode === "create") {
      createDay.mutate(formData);
    } else {
      if (selectedDay) {
        updateDay.mutate({ id: selectedDay.id, ...formData });
      }
    }
  };

  // Handle edit
  const handleEdit = (day: DayFromServer) => {
    setFormMode("edit");
    setSelectedDay(day);
    setFormData({ name: day.name });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (day: DayFromServer) => {
    setSelectedDay(day);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedDay) {
      deleteDay.mutate({ id: selectedDay.id });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "" });
    setSelectedDay(null);
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
        <h1 className="text-3xl font-bold">Daftar Hari</h1>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Hari
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Hari</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.length > 0 ? (
              days.map((day) => (
                <TableRow key={day.id}>
                  <TableCell className="font-medium">{day.name}</TableCell>
                  <TableCell>
                    {new Date(day.created_at).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(day)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(day)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  Belum ada data hari
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Tambah Hari Baru" : "Edit Hari"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Tambahkan hari baru ke dalam sistem"
                : "Perbarui nama hari yang sudah ada"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama Hari
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Contoh: Senin, Selasa, dll"
                  required
                />
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
                  createDay.status === "pending" ||
                  updateDay.status === "pending"
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
            <DialogTitle>Konfirmasi Hapus Hari</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus hari{" "}
              <strong>{selectedDay?.name}</strong>? Tindakan ini tidak dapat
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
              disabled={deleteDay.status === "pending"}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
