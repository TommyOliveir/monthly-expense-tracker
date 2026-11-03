"use client";

import { type FormEvent, useState } from "react";
import {
  CheckIcon,
  CircleAlertIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { CategoryAvatar } from "@/features/category/components/CategoryAvatar";
import { useCreateCategory } from "@/features/category/hooks/useCategory";
import { useDeleteCategory } from "@/features/category/hooks/useDeleteCategory";
import { useUpdateCategory } from "@/features/category/hooks/useUpdateCategory";
import type { Category } from "@/features/category/types/category";
import { getCategoryTone } from "@/features/category/utils/getCategoryTone";
import { validateCategoryName } from "@/features/category/utils/validateCategoryName";

type ManageCategoriesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCategoryCreated?: (category: Category) => void;
};

type CategoryRowProps = {
  category: Category;
  isEditing: boolean;
  isBusy: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onRename: (name: string) => Promise<string | null>;
  onRequestDelete: () => void;
};

export function ManageCategoriesDialog({
  open,
  onOpenChange,
  categories,
  onCategoryCreated,
}: ManageCategoriesDialogProps) {
  const { createCategoryAsync, isCreatingCategory } = useCreateCategory();
  const { updateCategoryAsync, isUpdatingCategory } = useUpdateCategory();
  const { deleteCategoryAsync, isDeletingCategory } = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [newNameError, setNewNameError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isBusy = isCreatingCategory || isUpdatingCategory || isDeletingCategory;
  const customCount = categories.filter(
    (category) => !category.isDefault,
  ).length;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNewName("");
      setNewNameError(null);
      setEditingId(null);
      setActionError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(null);

    const validation = validateCategoryName(newName, categories);
    if (!validation.ok) {
      setNewNameError(validation.error);
      return;
    }

    try {
      const created = await createCategoryAsync({ name: validation.name });
      setNewName("");
      toast.success(`Category “${created.name}” added`);
      onCategoryCreated?.(created);
    } catch (error) {
      setNewNameError(getErrorMessage(error));
    }
  };

  const handleRename = async (
    category: Category,
    name: string,
  ): Promise<string | null> => {
    setActionError(null);

    const validation = validateCategoryName(name, categories, category.id);
    if (!validation.ok) return validation.error;
    if (validation.name === category.name) {
      setEditingId(null);
      return null;
    }

    try {
      await updateCategoryAsync({
        id: category.id,
        payload: { name: validation.name },
      });
      setEditingId(null);
      toast.success("Category renamed");
      return null;
    } catch (error) {
      return getErrorMessage(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const category = pendingDelete;
    setActionError(null);

    try {
      await deleteCategoryAsync(category.id);
      toast.success(`Category “${category.name}” deleted`);
    } catch (error) {
      setActionError(
        `Couldn't delete “${category.name}”. ${getErrorMessage(error)}`,
      );
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Categories
            </DialogTitle>
            <DialogDescription>
              Add your own categories. Default categories can&apos;t be changed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} noValidate>
            <Field data-invalid={newNameError ? true : undefined}>
              <FieldLabel htmlFor="new-category-name">New category</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="new-category-name"
                  value={newName}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    setNewNameError(null);
                  }}
                  placeholder="e.g. Travel"
                  maxLength={50}
                  autoComplete="off"
                  disabled={isBusy}
                  aria-invalid={newNameError ? true : undefined}
                  aria-describedby={
                    newNameError ? "new-category-error" : undefined
                  }
                  className="h-10"
                />
                <Button type="submit" className="h-10 px-4" disabled={isBusy}>
                  <PlusIcon aria-hidden />
                  {isCreatingCategory ? "Adding…" : "Add"}
                </Button>
              </div>
              {newNameError && (
                <FieldError id="new-category-error">{newNameError}</FieldError>
              )}
            </Field>
          </form>

          {actionError && (
            <Alert variant="destructive">
              <CircleAlertIcon aria-hidden />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          <ul
            className="flex flex-col divide-y rounded-lg border"
            aria-label="Your categories"
          >
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                isEditing={editingId === category.id}
                isBusy={isBusy}
                onStartEdit={() => {
                  setActionError(null);
                  setEditingId(category.id);
                }}
                onCancelEdit={() => setEditingId(null)}
                onRename={(name) => handleRename(category, name)}
                onRequestDelete={() => setPendingDelete(category)}
              />
            ))}
          </ul>
          {customCount === 0 && (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t added any categories yet.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(nextOpen) => !nextOpen && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Categories that still have expenses
              can&apos;t be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCategory}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CategoryRow({
  category,
  isEditing,
  isBusy,
  onStartEdit,
  onCancelEdit,
  onRename,
  onRequestDelete,
}: CategoryRowProps) {
  const [draftName, setDraftName] = useState(category.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const inputId = `rename-category-${category.id}`;

  const handleRenameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRenameError(await onRename(draftName));
  };

  if (isEditing) {
    return (
      <li className="p-2">
        <form
          onSubmit={handleRenameSubmit}
          noValidate
          className="flex flex-col gap-1.5"
        >
          <label htmlFor={inputId} className="sr-only">
            Rename {category.name}
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              id={inputId}
              value={draftName}
              onChange={(event) => {
                setDraftName(event.target.value);
                setRenameError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  // Cancel the rename without closing the whole dialog.
                  event.stopPropagation();
                  onCancelEdit();
                }
              }}
              maxLength={50}
              autoFocus
              disabled={isBusy}
              aria-invalid={renameError ? true : undefined}
              className="h-10"
            />
            <Button
              type="submit"
              size="icon-lg"
              className="size-10"
              aria-label="Save name"
              disabled={isBusy}
            >
              <CheckIcon aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="size-10"
              aria-label="Cancel rename"
              onClick={onCancelEdit}
              disabled={isBusy}
            >
              <XIcon aria-hidden />
            </Button>
          </div>
          {renameError && <FieldError>{renameError}</FieldError>}
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 py-1.5 pr-1.5 pl-3">
      <CategoryAvatar
        name={category.name}
        tone={getCategoryTone(category.id)}
        className="size-8 rounded-lg"
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {category.name}
      </span>
      {category.isDefault ? (
        <Badge variant="secondary" className="mr-2">
          Default
        </Badge>
      ) : (
        <div className="flex shrink-0">
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-10"
            aria-label={`Rename ${category.name}`}
            onClick={() => {
              setDraftName(category.name);
              setRenameError(null);
              onStartEdit();
            }}
            disabled={isBusy}
          >
            <PencilIcon aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="size-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${category.name}`}
            onClick={onRequestDelete}
            disabled={isBusy}
          >
            <Trash2Icon aria-hidden />
          </Button>
        </div>
      )}
    </li>
  );
}
