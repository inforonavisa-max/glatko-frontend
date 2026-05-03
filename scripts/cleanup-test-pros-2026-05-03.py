#!/usr/bin/env python3
"""
Operational cleanup script — cascade DELETE 5 test pros (3 May 2026 pre-launch).

Reads delete plan from /tmp/glatko_delete_pros.json (built by previous probe).

Cascade order (children → parent):
  1. glatko_thread_messages (via thread_id)
  2. glatko_message_threads (via professional_id)
  3. glatko_request_quotes (via professional_id)
  4. glatko_quote_reviews (via professional_id)
  5. glatko_pro_application_answers (via professional_id)
  6. glatko_pro_services (via professional_id)
  7. glatko_notifications (via user_id == pro_id)
  8. glatko_professional_profiles (the pro itself)
  9. profiles (public profile, id == pro_id)
  10. auth.users (admin API delete by user_id)

Multi-layered KEEP guard runs before every DELETE to ensure neither
Ela Hilal (#2) nor OttoWin (#1) is touched.
"""
import os, json, urllib.request, urllib.error

URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

with open("/tmp/glatko_delete_pros.json") as f:
    plan = json.load(f)

DELETE_LIST = plan["delete"]
KEEP_LIST = plan["keep"]
DELETE_IDS = [d["id"] for d in DELETE_LIST]

# ---- Hard safety check ----
for kid in KEEP_LIST:
    if kid in DELETE_IDS:
        raise SystemExit(f"SAFETY ABORT: KEEP id {kid} is in DELETE list")
assert len(DELETE_IDS) == 5, f"Expected 5 delete IDs, got {len(DELETE_IDS)}"
assert len(KEEP_LIST) == 2, f"Expected 2 KEEP IDs, got {len(KEEP_LIST)}"

print(f"DELETE list ({len(DELETE_IDS)}):")
for d in DELETE_LIST:
    print(f"  - {d['id']} {d['name']}")
print(f"\nKEEP list ({len(KEEP_LIST)}):")
for k in KEEP_LIST:
    print(f"  - {k}")
print()

def delete(path, expect_status=(200, 204)):
    req = urllib.request.Request(
        f"{URL}/rest/v1/{path}",
        method="DELETE",
        headers={**H, "Prefer": "return=representation"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            try:
                body = r.read()
                rows = json.loads(body) if body else []
                return r.status, rows
            except json.JSONDecodeError:
                return r.status, []
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]

def get(path):
    req = urllib.request.Request(f"{URL}/rest/v1/{path}", headers=H)
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError:
        return []

def admin_delete_user(user_id):
    req = urllib.request.Request(
        f"{URL}/auth/v1/admin/users/{user_id}",
        method="DELETE",
        headers={"Authorization": f"Bearer {KEY}", "apikey": KEY},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code

stats = {
    "thread_messages": 0,
    "message_threads": 0,
    "request_quotes": 0,
    "quote_reviews": 0,
    "pro_application_answers": 0,
    "pro_services": 0,
    "notifications": 0,
    "professional_profiles": 0,
    "profiles": 0,
    "auth_users": 0,
}

print("=" * 90)
print("CASCADE DELETE — starting")
print("=" * 90)

for pid in DELETE_IDS:
    if pid in KEEP_LIST:
        print(f"  🛑 SKIP {pid} (in KEEP) — should not happen")
        continue

    print(f"\n--- Processing {pid[:8]} ---")

    # 1. Thread messages — for each of pro's threads, delete its messages first
    threads = get(f"glatko_message_threads?professional_id=eq.{pid}&select=id")
    for th in threads:
        s, rows = delete(f"glatko_thread_messages?thread_id=eq.{th['id']}")
        n = len(rows) if isinstance(rows, list) else 0
        if n:
            print(f"  thread_messages (thread {th['id'][:8]}): {n} deleted")
            stats["thread_messages"] += n

    # 2. Message threads
    s, rows = delete(f"glatko_message_threads?professional_id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  message_threads: {n} deleted")
        stats["message_threads"] += n

    # 3. Request quotes
    s, rows = delete(f"glatko_request_quotes?professional_id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  request_quotes: {n} deleted")
        stats["request_quotes"] += n

    # 4. Quote reviews (already 0, but cleanup just in case)
    s, rows = delete(f"glatko_quote_reviews?professional_id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  quote_reviews: {n} deleted")
        stats["quote_reviews"] += n

    # 5. Pro application answers
    s, rows = delete(f"glatko_pro_application_answers?professional_id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  pro_application_answers: {n} deleted")
        stats["pro_application_answers"] += n

    # 6. Pro services (also has ON DELETE CASCADE, explicit anyway)
    s, rows = delete(f"glatko_pro_services?professional_id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  pro_services: {n} deleted")
        stats["pro_services"] += n

    # 7. Notifications (user_id == pro_id since pros are users)
    s, rows = delete(f"glatko_notifications?user_id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  notifications: {n} deleted")
        stats["notifications"] += n

    # 8. Professional profile
    s, rows = delete(f"glatko_professional_profiles?id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  professional_profile: {n} deleted (status {s})")
        stats["professional_profiles"] += n
    else:
        print(f"  professional_profile delete: status {s}")

    # 9. Public profile
    s, rows = delete(f"profiles?id=eq.{pid}")
    n = len(rows) if isinstance(rows, list) else 0
    if n:
        print(f"  profile: {n} deleted (status {s})")
        stats["profiles"] += n
    else:
        print(f"  profile delete: status {s}")

    # 10. Auth user
    code = admin_delete_user(pid)
    if code in (200, 204):
        print(f"  auth.user: deleted (status {code})")
        stats["auth_users"] += 1
    else:
        print(f"  auth.user delete: status {code} (may need manual cleanup)")

print("\n" + "=" * 90)
print("STATS SUMMARY")
print("=" * 90)
for k, v in stats.items():
    print(f"  {k}: {v}")

with open("/tmp/glatko_cleanup_stats.json", "w") as f:
    json.dump(stats, f, indent=2)
print("\n✓ Stats saved to /tmp/glatko_cleanup_stats.json")
