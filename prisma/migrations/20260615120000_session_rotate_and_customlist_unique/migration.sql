-- Add `passwordChangedAt` to User so we can invalidate any session whose
-- `iat` predates the most recent password change (B-3 from the audit).
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- Make (userId, name) the natural identity of a CustomList so concurrent
-- bookmark toggles can no longer race-create duplicate "Bookmarks" lists
-- (B-4 from the audit). Before this unique index the only identity was the
-- row id, so `findFirst` + `create` had a classic check-then-create race.
--
-- Safe to add: if the database already contains duplicate (userId, name)
-- rows, this statement will fail. In that case run the seed's orphan
-- cleanup once (`npm run db:seed -- --reset`) to de-dupe, then re-apply.
CREATE UNIQUE INDEX "CustomList_userId_name_key" ON "CustomList"("userId", "name");
