"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addProblemToListAction } from "@/app/lists/actions";
import { toast } from "@/components/ui/toast";

export function SaveToListButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} className="gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

export function SaveToListForm({
  problemSlug,
  returnTo,
  lists,
}: {
  problemSlug: string;
  returnTo: string;
  lists: { id: string; name: string }[];
}) {
  return (
    <form
      action={async (formData) => {
        try {
          await addProblemToListAction(formData);
          toast("Saved to list", { key: "save-to-list" });
        } catch {
          toast("Couldn't save to the list", { tone: "error" });
        }
      }}
      className="space-y-2"
    >
      <input type="hidden" name="problemSlug" value={problemSlug} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Save to list
      </label>
      <div className="flex gap-2">
        <select name="listId" className="field min-w-0 flex-1" aria-label="Choose a list">
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        <SaveToListButton />
      </div>
    </form>
  );
}
