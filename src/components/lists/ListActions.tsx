"use client";

import type * as React from "react";
import { useRef, useState, useTransition } from "react";
import { Check, Copy, Globe, ListChecks, Pencil, Trash2, X } from "lucide-react";

import {
  bulkMoveToListAction,
  bulkRemoveFromListAction,
  createListAction,
  deleteListAction,
  removeProblemFromListAction,
  renameListAction,
  toggleListPublicAction,
} from "@/app/lists/actions";
import { Button } from "@/components/ui/button";
import { ProblemCard } from "@/components/problems/ProblemCard";
import {
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

function formData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) fd.set(key, value);
  return fd;
}

/**
 * Shared destructive-action confirmation. Destructive server actions run
 * from the confirm button inside a transition; success toasts, failures
 * surface as error toasts instead of silent re-renders.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="fixed left-1/2 top-1/2 w-[min(24rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 data-[starting-style]:scale-95 data-[ending-style]:scale-95">
          <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <DialogClose className="inline-flex min-h-[44px] items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground">
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={pending}
              onClick={onConfirm}
              className="inline-flex min-h-[44px] items-center rounded-md bg-ink-red px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Working…" : confirmLabel}
            </button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}

/**
 * RemoveFromListButton — bordered chip with a confirm dialog guard,
 * replacing the easy-to-miss text link under each card.
 */
export function RemoveFromListButton({
  listId,
  problemSlug,
  listName,
  returnTo,
  onRemove,
}: {
  listId: string;
  problemSlug: string;
  listName: string;
  returnTo: string;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Remove from ${listName}`}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-ink-red hover:border-ink-red/50 transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        Remove
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Remove from ${listName}?`}
        description="The problem stays in your library and any other lists."
        confirmLabel="Remove"
        pending={pending}
        onConfirm={() => {
          setOpen(false);
          onRemove?.();
          startTransition(async () => {
            try {
              await removeProblemFromListAction(
                formData({ listId, problemSlug, returnTo }),
              );
              toast("Removed from list");
            } catch {
              toast("Couldn't remove the problem", { tone: "error" });
            }
          });
        }}
      />
    </>
  );
}

/**
 * CreateListForm — new-list form with success toast and reset.
 */
export function CreateListForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        try {
          const result = await createListAction(fd);
          if (!result.ok) {
            toast("Couldn't create the list", { tone: "error" });
            return;
          }
          formRef.current?.reset();
          toast("List created");
        } catch {
          toast("Couldn't create the list", { tone: "error" });
        }
      }}
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
    >
      <input
        aria-label="List name"
        type="text"
        name="name"
        required
        placeholder="List name"
        className="field"
      />
      <input
        aria-label="List description"
        type="text"
        name="description"
        placeholder="Optional description"
        className="field"
      />
      <Button type="submit">Create</Button>
    </form>
  );
}

/**
 * ListActions — rename and delete for custom lists (the bookmark list is
 * structural and intentionally has neither).
 */
export function ListActions({
  listId,
  name,
  description,
  isBookmark,
}: {
  listId: string;
  name: string;
  description: string;
  isBookmark: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [currentName, setCurrentName] = useState(name);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (isBookmark) return null;

  if (editing) {
    return (
      <form
        action={async (fd) => {
          const newName = (fd.get("name") as string) || currentName;
          const prevName = currentName;
          setCurrentName(newName);
          setEditing(false);
          startTransition(async () => {
            try {
              await renameListAction(fd);
              toast("List renamed");
            } catch {
              setCurrentName(prevName);
              toast("Couldn't rename the list", { tone: "error" });
            }
          });
        }}
        className="w-full space-y-3 rounded-xl border border-border bg-surface-2 p-4"
      >
        <input type="hidden" name="listId" value={listId} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            defaultValue={currentName}
            required
            aria-label="List name"
            className="field text-sm"
          />
          <input
            type="text"
            name="description"
            defaultValue={description}
            placeholder="Optional description"
            aria-label="List description"
            className="field text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center rounded-md border border-ink bg-ink px-4 py-2 text-small font-medium text-paper transition-colors hover:bg-ink-blue hover:border-ink-blue cursor-pointer"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex min-h-[44px] items-center rounded-md border border-border px-4 py-2 text-small font-medium text-muted-foreground hover:text-ink-blue hover:border-ink-blue transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-ink-blue hover:border-ink-blue/50 transition-colors cursor-pointer"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
        Rename
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        title={`Delete ${currentName}`}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-ink-red hover:border-ink-red/50 transition-colors cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        Delete
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${currentName}”?`}
        description="Its saved problems stay bookmarked. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => {
          startTransition(async () => {
            try {
              await deleteListAction(formData({ listId }));
              setConfirmOpen(false);
              toast("List deleted");
            } catch {
              toast("Couldn't delete the list", { tone: "error" });
            }
          });
        }}
      />
    </div>
  );
}

/**
 * ShareButton — public/private toggle plus copy-link. Public lists resolve
 * at `/lists/[id]` for anyone with the link (see that route).
 */
export function ShareButton({
  listId,
  initialPublic,
}: {
  listId: string;
  initialPublic: boolean;
}) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const next = !isPublic;
          setIsPublic(next);
          startTransition(async () => {
            try {
              const res = await toggleListPublicAction(formData({ listId }));
              if (!res) throw new Error("no result");
              setIsPublic(res.isPublic);
              toast(res.isPublic ? "List is now public" : "List is now private");
            } catch {
              setIsPublic(!next);
              toast("Couldn't update sharing", { tone: "error" });
            }
          });
        }}
        aria-pressed={isPublic}
        title={isPublic ? "Make private" : "Make public"}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 ${
          isPublic
            ? "border-ink-blue/40 bg-ink-blue-wash text-ink-blue"
            : "border-border text-muted-foreground hover:text-foreground hover:border-border-hover"
        }`}
      >
        <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
        {isPublic ? "Public" : "Private"}
      </button>
      {isPublic && (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                `${window.location.origin}/lists/${listId}`,
              );
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
              toast("Link copied");
            } catch {
              toast("Couldn't copy the link", { tone: "error" });
            }
          }}
          aria-label="Copy public link"
          title="Copy public link"
          className="grid h-10 w-10 min-h-[44px] min-w-[44px] place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

type ManagerProblem = React.ComponentProps<typeof ProblemCard>["problem"];

/**
 * ListItemsManager — per-list grid with optional multi-select mode feeding
 * a bulk action bar (move to another list, or remove). Owns selection
 * state; the server page stays a plain data fetch.
 */
export function ListItemsManager({
  listId,
  listName,
  items,
  bookmarkedIds,
  moveTargets,
}: {
  listId: string;
  listName: string;
  items: {
    problemId: string;
    slug: string;
    problem: ManagerProblem;
    moduleName?: string;
    topicName?: string;
  }[];
  bookmarkedIds: string[];
  moveTargets: { id: string; name: string }[];
}) {
  const [localItems, setLocalItems] = useState(items);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetId, setTargetId] = useState(moveTargets[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const bookmarked = new Set(bookmarkedIds);

  const toggleOne = (problemId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) next.delete(problemId);
      else next.add(problemId);
      return next;
    });
  };

  const handleSingleRemove = (slug: string) => {
    setLocalItems((curr) => curr.filter((x) => x.slug !== slug));
  };

  const runBulk = (kind: "remove" | "move") => {
    const problemIds = Array.from(selected);
    if (problemIds.length === 0) return;
    const prevItems = localItems;
    if (kind === "remove") {
      setLocalItems((curr) => curr.filter((x) => !selected.has(x.problemId)));
    }
    setSelected(new Set());
    const fd = new FormData();
    fd.set("returnTo", "/lists");
    for (const id of problemIds) fd.append("problemIds", id);
    startTransition(async () => {
      try {
        if (kind === "remove") {
          fd.set("listId", listId);
          await bulkRemoveFromListAction(fd);
          toast(`Removed ${problemIds.length} problem${problemIds.length === 1 ? "" : "s"}`);
        } else {
          if (!targetId) return;
          fd.set("fromListId", listId);
          fd.set("toListId", targetId);
          await bulkMoveToListAction(fd);
          toast(`Moved ${problemIds.length} problem${problemIds.length === 1 ? "" : "s"}`);
        }
      } catch {
        setLocalItems(prevItems);
        toast("Bulk action failed", { tone: "error" });
      }
    });
  };

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSelecting((v) => !v);
            setSelected(new Set());
          }}
          aria-pressed={selecting}
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
            selecting
              ? "border-ink-blue/40 bg-ink-blue-wash text-ink-blue"
              : "border-border text-muted-foreground hover:text-foreground hover:border-border-hover"
          }`}
        >
          <ListChecks className="h-3.5 w-3.5" strokeWidth={1.5} />
          {selecting ? "Cancel" : "Select"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {localItems.map(({ problemId, slug, problem, moduleName, topicName }) => {
          const checked = selected.has(problemId);
          return (
            <div key={problemId} className="relative space-y-2">
              {selecting && (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={`Select ${problem.title}`}
                  onClick={() => toggleOne(problemId)}
                  className="absolute left-2 top-2 z-10 grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center"
                >
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-md border transition-colors ${
                      checked
                        ? "border-ink-blue bg-ink-blue text-white"
                        : "border-border-hover bg-surface-1 text-transparent hover:border-ink-blue"
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                </button>
              )}
              <ProblemCard
                problem={problem}
                moduleName={moduleName}
                topicName={topicName}
                bookmarked={bookmarked.has(problemId)}
                signedIn
                returnTo="/lists"
              />
              {!selecting && (
                <RemoveFromListButton
                  listId={listId}
                  problemSlug={slug}
                  listName={listName}
                  returnTo="/lists"
                  onRemove={() => handleSingleRemove(slug)}
                />
              )}
            </div>
          );
        })}
      </div>

      {selecting && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-1 px-4 py-3 shadow-[var(--shadow-pop)]">
          <span className="text-sm font-medium tabular-nums">
            {selected.size} selected
          </span>
          {moveTargets.length > 0 && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={pending}
              aria-label="Move to list"
              className="field min-w-0 flex-1 min-h-[44px] text-sm"
            >
              {moveTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  Move to {t.name}
                </option>
              ))}
            </select>
          )}
          {moveTargets.length > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() => runBulk("move")}
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-border-hover disabled:opacity-60"
            >
              Move
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("remove")}
            className="inline-flex min-h-[44px] items-center rounded-md border border-ink-red/40 px-4 py-2 text-sm font-medium text-ink-red transition-colors hover:bg-ink-red-wash disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
