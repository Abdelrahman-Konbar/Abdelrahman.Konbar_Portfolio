import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { importApprovedContent } from "../content/initialImport";
import { supabase } from "../lib/supabase";

type Row = Record<string, any>;
type Tab =
  | "overview"
  | "content"
  | "projects"
  | "cases"
  | "media"
  | "expertise"
  | "experience"
  | "profile"
  | "settings";
const tabs: [Tab, string][] = [
  ["overview", "Overview"],
  ["content", "Website Content"],
  ["projects", "Projects"],
  ["cases", "Case Studies"],
  ["media", "Media Library"],
  ["expertise", "Expertise"],
  ["experience", "Experience"],
  ["profile", "Resume & Profile"],
  ["settings", "Site Settings"],
];
const Btn = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...p}
    type={p.type ?? "button"}
    className={`rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 ${p.className ?? ""}`}
  />
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="mt-1 w-full rounded border border-slate-300 p-2" />
);
const Area = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...p}
    className={`mt-1 min-h-28 w-full rounded border border-slate-300 p-2 ${p.className ?? ""}`}
  />
);
async function edgeErrorMessage(error: { message: string; context?: unknown }) {
  const response = error.context instanceof Response ? error.context : null;
  if (!response) return error.message;
  try {
    const body = await response.clone().json();
    return typeof body?.detail === "string"
      ? `${body.error}: ${body.detail}`
      : String(body?.error ?? error.message);
  } catch {
    return error.message;
  }
}

export function Admin() {
  const [session, setSession] = useState<Session | null>(null),
    [owner, setOwner] = useState<boolean | null>(null),
    [tab, setTab] = useState<Tab>("overview"),
    [notice, setNotice] = useState("");
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return supabase.auth.onAuthStateChange((_e, s) => setSession(s)).data.subscription.unsubscribe;
  }, []);
  useEffect(() => {
    if (!supabase || !session) {
      setOwner(null);
      return;
    }
    void supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setOwner(Boolean(data)));
  }, [session]);
  if (!supabase)
    return (
      <Gate
        title="Supabase is not configured"
        body="Add the publishable URL and key to .env.local."
      />
    );
  if (!session) return <Login setSession={setSession} />;
  if (owner === null)
    return (
      <Gate title="Checking authorization" body="Verifying this account against admin_users." />
    );
  if (!owner)
    return (
      <Gate
        title="Not authorized"
        body="This authenticated account is not an approved owner."
        logout
      />
    );
  const logout = () => {
    void supabase!.auth.signOut();
  };
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Portfolio CMS
            </p>
            <b>Abdelrahman Konbar</b>
          </div>
          <div className="flex gap-3">
            <a href="#/" className="text-sm underline">
              View portfolio
            </a>
            <Btn onClick={logout}>Log out</Btn>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-auto lg:flex-col">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-2 text-left text-sm ${tab === id ? "bg-slate-900 text-white" : "bg-white"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <main>
          <Notice value={notice} clear={() => setNotice("")} />
          {tab === "overview" && <Overview notify={setNotice} />}
          {tab === "content" && (
            <SiteForm kind="homepage" title="Website Content" notify={setNotice} />
          )}
          {tab === "profile" && (
            <SiteForm kind="profile" title="Resume & Profile" notify={setNotice} />
          )}
          {tab === "settings" && <SiteForm kind="seo" title="Site Settings" notify={setNotice} />}
          {tab === "projects" && <Projects notify={setNotice} />}{" "}
          {tab === "cases" && <Cases notify={setNotice} />}{" "}
          {tab === "media" && <Media notify={setNotice} />}{" "}
          {tab === "experience" && <Experience notify={setNotice} />}
          {tab === "expertise" && <Expertise notify={setNotice} />}
        </main>
      </div>
    </div>
  );
}
function Gate({ title, body, logout }: { title: string; body: string; logout?: boolean }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-5">
      <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-slate-600">{body}</p>
        {logout && (
          <Btn className="mt-5" onClick={() => void supabase?.auth.signOut()}>
            Log out
          </Btn>
        )}
      </div>
    </div>
  );
}
function Notice({ value, clear }: { value: string; clear: () => void }) {
  return value ? (
    <div className="mb-4 flex justify-between rounded bg-emerald-100 p-3 text-sm text-emerald-900">
      {value}
      <button onClick={clear}>×</button>
    </div>
  ) : null;
}
function Login({ setSession }: { setSession: (s: Session | null) => void }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === "Failed to fetch"
          ? "The configured Supabase Auth service cannot be reached. Verify VITE_SUPABASE_URL and restart Vite after correcting .env.local."
          : error.message,
      );
    } else setSession(data.session);
  };
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-5">
      <form onSubmit={go} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Private area
        </p>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <label>
          Email
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Btn className="w-full">Sign in</Btn>
      </form>
    </div>
  );
}
function Overview({ notify }: { notify: (value: string) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [importing, setImporting] = useState(false);
  const [confirmingImport, setConfirmingImport] = useState(false);
  const [importStage, setImportStage] = useState("");
  useEffect(() => {
    void supabase!
      .from("projects")
      .select("status")
      .then(({ data, error }) => {
        if (error) notify(error.message);
        else setRows(data ?? []);
      });
  }, []);
  const importContent = async () => {
    console.info("[portfolio import] confirmed by owner");
    setConfirmingImport(false);
    setImporting(true);
    setImportStage("Starting import…");
    try {
      const result = await importApprovedContent(supabase!, (stage) => {
        console.info("[portfolio import]", stage);
        setImportStage(stage);
      });
      setImportStage("Import complete.");
      notify(
        result.inserted.length
          ? `Imported ${result.inserted.length} approved records. ${result.existing.length} existing records were preserved.${result.conflicts.length ? ` ${result.conflicts.length} project conflict(s) were skipped.` : ""}`
          : `Nothing imported. ${result.existing.length} existing records were preserved.${result.conflicts.length ? ` ${result.conflicts.length} project conflict(s) were skipped.` : ""}`,
      );
      const { data } = await supabase!.from("projects").select("status");
      setRows(data ?? []);
    } catch (error) {
      console.error("[portfolio import] failed", error);
      setImportStage("Import failed.");
      notify(
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Initial content import failed.",
      );
    } finally {
      setImporting(false);
    }
  };
  return (
    <section>
      <h2 className="text-2xl font-semibold">Overview</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          ["Projects", rows.length],
          ["Published", rows.filter((x) => x.status === "published").length],
          ["Drafts", rows.filter((x) => x.status === "draft").length],
        ].map(([x, n]) => (
          <div key={String(x)} className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-600">{x}</p>
            <p className="text-3xl font-semibold">{n}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        <h3 className="font-semibold">Initial approved-content import</h3>
        <p className="mt-1 max-w-2xl text-sm text-slate-700">
          Imports the checked-in profile, homepage, experience, expertise, and three projects only
          when their stable records do not already exist. It never overwrites remote editorial work,
          media, or case-study blocks.
        </p>
        {!confirmingImport ? (
          <Btn
            className="mt-3 bg-indigo-700"
            disabled={importing}
            onClick={() => setConfirmingImport(true)}
          >
            {importing ? "Importing…" : "Import missing approved content"}
          </Btn>
        ) : (
          <div className="mt-4 rounded-lg border border-indigo-300 bg-white p-4">
            <p className="text-sm text-slate-800">
              Import only missing approved local records? Existing Supabase content will not be
              changed.
            </p>
            <div className="mt-3 flex gap-2">
              <Btn
                className="bg-indigo-700"
                disabled={importing}
                onClick={() => void importContent}
              >
                {importing ? "Importing…" : "Confirm import"}
              </Btn>
              <Btn
                className="bg-slate-500"
                disabled={importing}
                onClick={() => {
                  setConfirmingImport(false);
                  notify("Import cancelled. No content was changed.");
                }}
              >
                Cancel
              </Btn>
            </div>
          </div>
        )}
        {importStage && (
          <p role="status" className="mt-3 text-sm text-slate-700">
            {importStage}
          </p>
        )}
      </div>
    </section>
  );
}
function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    if (dirty) window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

function readText(source: Row, path: string, fallback = "") {
  const result = path
    .split(".")
    .reduce<unknown>((value, key) => (value as Row | undefined)?.[key], source);
  return typeof result === "string" ? result : fallback;
}
function writeText(source: Row, path: string, value: string): Row {
  const keys = path.split(".");
  const output: Row = { ...source };
  let cursor: Row = output;
  let input: Row = source;
  for (const key of keys.slice(0, -1)) {
    const current = input[key];
    cursor[key] = Array.isArray(current) ? [...current] : { ...(current as Row | undefined) };
    cursor = cursor[key] as Row;
    input = (input[key] as Row | undefined) ?? {};
  }
  cursor[keys.at(-1)!] = value;
  return output;
}
function SiteForm({
  kind,
  title,
  notify,
}: {
  kind: "homepage" | "profile" | "seo";
  title: string;
  notify: (v: string) => void;
}) {
  const [value, setValue] = useState<Row>({}),
    [saved, setSaved] = useState("{}"),
    [status, setStatus] = useState("draft"),
    [saving, setSaving] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<Row[]>([]);
  const dirty = JSON.stringify(value) !== saved;
  useUnsavedWarning(dirty);
  useEffect(() => {
    void supabase!
      .from("site_settings")
      .select(`${kind},status`)
      .eq("id", "primary")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return notify(error.message);
        const next = ((data as Row | null)?.[kind] as Row | undefined) ?? {};
        setValue(next);
        setSaved(JSON.stringify(next));
        setStatus(((data as Row | null)?.status as string) ?? "draft");
      });
  }, [kind, notify]);
  useEffect(() => {
  if (kind !== "profile") return;
  void supabase!
    .from("media_assets")
    .select("id,alt_text")
    .eq("is_public", true)
    .eq("media_type", "image")
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) return notify(error.message);
      setAvatarOptions(data ?? []);
    });
}, [kind, notify]);
  const save = async (nextStatus = status) => {
    setSaving(true);
    const published = nextStatus === "published";
    const { error } = await supabase!.from("site_settings").upsert({
      id: "primary",
      [kind]: value,
      status: nextStatus,
      published_at: published ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (error) return notify(error.message);
    setSaved(JSON.stringify(value));
    setStatus(nextStatus);
    notify(published ? "Published content saved." : "Draft saved.");
  };
  const fields =
    kind === "homepage"
      ? [
        ["hero.screenReaderHeadline", "Hero accessibility headline", false],
        ["hero.lines.0", "Hero line 1", false],
        ["hero.lines.1", "Hero line 2", false],
        ["hero.lines.2", "Hero line 3", false],
        ["hero.lines.3", "Hero line 4", false],
        ["hero.lines.4", "Hero line 5", false],
        ["hero.role", "Professional role", false],
        ["hero.description", "Hero description", true],
        ["hero.meta.basedIn", "Hero location label", false],
        ["hero.meta.availability", "Hero availability label", false],
        ["hero.meta.focus", "Hero focus label", false],
        ["hero.meta.practice", "Hero practice label", false],
        ["selectedWork.heading.0", "Selected work heading 1", false],
        ["selectedWork.heading.1", "Selected work heading 2", false],
        ["selectedWork.heading.2", "Selected work heading 3", false],
        ["selectedWork.description", "Selected work description", true],
        ["selectedWork.notice", "Selected work notice", true],
        ["expertise.heading.0", "Expertise heading 1", false],
        ["expertise.heading.1", "Expertise heading 2", false],
        ["expertise.description", "Expertise description", true],
        ["experience.heading.0", "Experience heading 1", false],
        ["experience.heading.1", "Experience heading 2", false],
        ["experience.heading.2", "Experience heading 3", false],
        ["experience.description", "Experience description", true],
        ["philosophy.manifesto", "Philosophy manifesto", true],
        ["philosophy.tenets.0.title", "Philosophy principle I", false],
        ["philosophy.tenets.0.body", "Principle I description", true],
        ["philosophy.tenets.1.title", "Philosophy principle II", false],
        ["philosophy.tenets.1.body", "Principle II description", true],
        ["philosophy.tenets.2.title", "Philosophy principle III", false],
        ["philosophy.tenets.2.body", "Principle III description", true],
        ["contact.availability", "Contact availability", false],
        ["contact.heading.0", "Contact heading 1", false],
        ["contact.heading.1", "Contact heading 2", false],
        ["contact.description", "Contact description", true],
      ]
      : kind === "profile"
        ? [
          ["name", "Full name", false],
          ["firstName", "First name", false],
          ["lastName", "Last name", false],
          ["role", "Professional role", false],
          ["location", "Location", false],
          ["availability", "Availability", false],
          ["email", "Email", false],
          ["linkedinUrl", "LinkedIn URL", false],
          ["resumePdfUrl", "Resume PDF URL", false],
        ]
        : [
          ["title", "SEO title", false],
          ["description", "SEO description", true],
        ];
  return (
    <section>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Edits stay private until you explicitly publish them.
      </p>
      <div className="mt-5 grid gap-4 rounded-xl bg-white p-5 shadow md:grid-cols-2">
        {fields.map(([path, label, multiline]) => (
          <label key={path as string} className={multiline ? "md:col-span-2" : ""}>
            {label as string}
            {multiline ? (
              <Area
                value={readText(value, path as string)}
                onChange={(e) => setValue(writeText(value, path as string, e.target.value))}
              />
            ) : (
              <Input
                value={readText(value, path as string)}
                onChange={(e) => setValue(writeText(value, path as string, e.target.value))}
              />
            )}
          </label>
        ))}
        {kind === "profile" && (
  <label className="md:col-span-2">
    Profile photo
    <select
      className="mt-1 w-full rounded border border-slate-300 p-2"
      value={readText(value, "avatarMediaId")}
      onChange={(e) =>
        setValue(writeText(value, "avatarMediaId", e.target.value))
      }
    >
      <option value="">No photo (AK)</option>
      {avatarOptions.map((asset) => (
        <option key={asset.id} value={asset.id}>
          {asset.alt_text || asset.id}
        </option>
      ))}
    </select>
  </label>
)}
        {kind === "profile" && (
          <label className="md:col-span-2">
            Specialisations, one per line
            <Area
              value={Array.isArray(value.specialization) ? value.specialization.join("\n") : ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  specialization: e.target.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600">
          {dirty ? "Unsaved changes" : `Saved as ${status}`}
        </span>
        <Btn disabled={!dirty || saving} onClick={() => void save("draft")}>
          {saving ? "Saving…" : "Save draft"}
        </Btn>
        <Btn className="bg-indigo-700" disabled={saving} onClick={() => void save("published")}>
          Publish
        </Btn>
      </div>
    </section>
  );
}
const blank = {
  id: "",
  slug: "",
  name: "",
  project_index: "",
  category: "",
  kind: "",
  tagline: "",
  description: "",
  atmosphere: "architectural",
  featured: false,
  display_order: 0,
  status: "draft",
  focus: [],
  contribution: [],
};
function Projects({ notify }: { notify: (x: string) => void }) {
  const [rows, setRows] = useState<Row[]>([]),
    [edit, setEdit] = useState<Row | null>(null);
  const load = () =>
    supabase!
      .from("projects")
      .select("*")
      .order("display_order")
      .then(({ data }) => setRows(data ?? []));
  useEffect(() => {
    void load();
  }, []);
  const save = async () => {
    if (!edit) return;
    const row = {
      ...edit,
      id: edit.id || crypto.randomUUID(),
      focus: Array.isArray(edit.focus)
        ? edit.focus
        : String(edit.focus).split("\n").filter(Boolean),
      contribution: Array.isArray(edit.contribution)
        ? edit.contribution
        : String(edit.contribution).split("\n").filter(Boolean),
      published_at:
        edit.status === "published" ? edit.published_at || new Date().toISOString() : null,
    };
    const { error } = await supabase!.from("projects").upsert(row);
    notify(error ? error.message : "Project saved.");
    if (!error) {
      setEdit(null);
      void load();
    }
  };
  return (
    <section>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <Btn onClick={() => setEdit({ ...blank, display_order: rows.length })}>New project</Btn>
      </div>
      {edit && (
        <div className="mt-5 grid gap-3 rounded-xl bg-white p-5 shadow md:grid-cols-2">
          {["name", "slug", "project_index", "category", "kind", "tagline"].map((k) => (
            <label key={k}>
              {k.replace(/_/g, " ")}
              <Input
                value={edit[k] ?? ""}
                onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
              />
            </label>
          ))}
          <label>
            Description
            <Area
              value={edit.description}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            />
          </label>
          <label>
            Focus, one per line
            <Area
              value={(edit.focus ?? []).join("\n")}
              onChange={(e) => setEdit({ ...edit, focus: e.target.value })}
            />
          </label>
          <label>
            Contributions, one per line
            <Area
              value={(edit.contribution ?? []).join("\n")}
              onChange={(e) => setEdit({ ...edit, contribution: e.target.value })}
            />
          </label>
          <label>
            Order
            <Input
              type="number"
              value={edit.display_order}
              onChange={(e) => setEdit({ ...edit, display_order: Number(e.target.value) })}
            />
          </label>
          <label>
            Status
            <select
              className="mt-1 w-full rounded border p-2"
              value={edit.status}
              onChange={(e) => setEdit({ ...edit, status: e.target.value })}
            >
              <option>draft</option>
              <option>published</option>
              <option>archived</option>
            </select>
          </label>
          <label className="mt-6 flex gap-2">
            <input
              type="checkbox"
              checked={edit.featured}
              onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
            />
            Featured
          </label>
          <div className="flex gap-2">
            <Btn onClick={() => void save()}>Save</Btn>
            <Btn className="bg-slate-500" onClick={() => setEdit(null)}>
              Cancel
            </Btn>
          </div>
          {edit.id && <ProjectMedia projectId={edit.id} notify={notify} />}
        </div>
      )}
      <div className="mt-5 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex justify-between rounded-xl bg-white p-4 shadow">
            <span>
              <b>{r.name}</b> <small>{r.status}</small>
            </span>
            <button className="underline" onClick={() => setEdit(r)}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
function DirectImageUpload({
  label,
  notify,
  onReady,
}: {
  label: string;
  notify: (value: string) => void;
  onReady: (mediaId: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null),
    [alt, setAlt] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState("");
  const select = (next: File | null) => {
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : "");
  };
  const upload = async () => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 52_428_800)
      return notify("Choose an image smaller than 50 MiB.");
    setBusy(true);
    const id = crypto.randomUUID(),
      path = `drafts/${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase!.storage
      .from("portfolio-private")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      setBusy(false);
      return notify(uploadError.message);
    }
    const { error: metadataError } = await supabase!.from("media_assets").insert({
      id,
      bucket: "portfolio-private",
      storage_path: path,
      media_type: "image",
      alt_text: alt,
      is_public: false,
    });
    if (metadataError) {
      setBusy(false);
      return notify(metadataError.message);
    }
    const { error: promoteError } = await supabase!.functions.invoke("promote-media", {
      body: { mediaId: id },
    });
    setBusy(false);
    if (promoteError)
      return notify(
        `Upload completed, but promotion failed: ${await edgeErrorMessage(promoteError)}`,
      );
    onReady(id);
    notify("Image uploaded, promoted, and attached.");
    setFile(null);
    setPreview("");
  };
  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-3">
      <p className="text-sm font-medium">{label}</p>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={(e) => select(e.target.files?.[0] ?? null)}
      />
      <Input
        placeholder="Required descriptive alt text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
      />
      {preview && (
        <img
          className="mt-3 max-h-36 rounded object-cover"
          src={preview}
          alt="Selected upload preview"
        />
      )}
      <Btn className="mt-3" disabled={!file || !alt.trim() || busy} onClick={() => void upload()}>
        {busy ? "Uploading…" : "Upload image"}
      </Btn>
    </div>
  );
}
function ProjectMedia({
  projectId,
  notify,
}: {
  projectId: string;
  notify: (value: string) => void;
}) {
  const [assets, setAssets] = useState<Row[]>([]),
    [attached, setAttached] = useState<Row[]>([]),
    [mediaId, setMediaId] = useState(""),
    [role, setRole] = useState("cover"),
    [order, setOrder] = useState(0);
  const load = () => {
    void supabase!
      .from("media_assets")
      .select("id,alt_text,is_public,media_type")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAssets(data ?? []);
        if (!mediaId && data?.[0]) setMediaId(data[0].id);
      });
    void supabase!
      .from("project_media")
      .select("media_id,role,display_order,media_assets(alt_text)")
      .eq("project_id", projectId)
      .order("display_order")
      .then(({ data }) => setAttached(data ?? []));
  };
  useEffect(load, [projectId]);
  const attach = async (selectedMediaId = mediaId) => {
    if (!selectedMediaId) return;
    // Replacing a cover only removes its relationship; it never deletes the media asset.
    if (role === "cover") {
      const { error: removeError } = await supabase!
        .from("project_media")
        .delete()
        .eq("project_id", projectId)
        .eq("role", "cover");
      if (removeError) return notify(removeError.message);
    }
    const { error } = await supabase!.from("project_media").upsert({
      project_id: projectId,
      media_id: selectedMediaId,
      role,
      display_order: role === "cover" ? 0 : order,
    });
    notify(error ? error.message : "Media attached.");
    if (!error) load();
  };
  const detach = async (attachedMediaId: string) => {
    const { error } = await supabase!
      .from("project_media")
      .delete()
      .eq("project_id", projectId)
      .eq("media_id", attachedMediaId);

    if (error) return notify(error.message);
    notify("Media removed from project.");
    load();
  };
  return (
    <div className="md:col-span-2 rounded-lg border border-slate-200 p-4">
      <p className="font-medium">Published project media</p>
      <p className="mt-1 text-xs text-slate-600">
        Upload here or choose an existing image. Replacing a cover keeps the previous asset in the
        library.
      </p>
      <DirectImageUpload
        label={`Upload and attach as ${role}`}
        notify={notify}
        onReady={(id) => void attach(id)}
      />
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <select
          className="rounded border p-2 md:col-span-2"
          value={mediaId}
          onChange={(e) => setMediaId(e.target.value)}
        >
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.alt_text || asset.id}
            </option>
          ))}
        </select>
        <select
          className="rounded border p-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="cover">Cover</option>
          <option value="gallery">Gallery</option>
        </select>
        <Input
          type="number"
          aria-label="Gallery order"
          disabled={role === "cover"}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
        />
      </div>
      <Btn className="mt-3" disabled={!mediaId} onClick={() => void attach()}>
        Attach media
      </Btn>
      <ul className="mt-3 space-y-1 text-sm">
        {attached.map((item) => (
          <li key={item.media_id}>
            {item.role} · {(item.media_assets as Row | null)?.alt_text || item.media_id}
            <Btn onClick={() => void detach(String(item.media_id))}>
              Remove from project
            </Btn>
          </li>
        ))}
      </ul>
    </div>
  );
}
function Cases({ notify }: { notify: (x: string) => void }) {
  const [projects, setProjects] = useState<Row[]>([]),
    [project, setProject] = useState(""),
    [blocks, setBlocks] = useState<Row[]>([]);
  useEffect(() => {
    void supabase!
      .from("projects")
      .select("id,name")
      .order("display_order")
      .then(({ data }) => {
        setProjects(data ?? []);
        if (data?.[0]) setProject((x) => x || data[0].id);
      });
  }, []);
  useEffect(() => {
    if (project)
      void supabase!
        .from("case_study_blocks")
        .select("*")
        .eq("project_id", project)
        .order("display_order")
        .then(({ data }) => setBlocks(data ?? []));
  }, [project]);
  const add = () =>
    setBlocks([
      ...blocks,
      {
        id: crypto.randomUUID(),
        project_id: project,
        block_type: "richText",
        display_order: blocks.length,
        payload: {},
        status: "draft",
      },
    ]);
  const save = async () => {
    for (const b of blocks) {
      const { error } = await supabase!.from("case_study_blocks").upsert({
        ...b,
        payload: { ...b.payload, id: b.id, type: b.block_type, order: b.display_order },
        published_at: b.status === "published" ? b.published_at || new Date().toISOString() : null,
      });
      if (error) return notify(error.message);
    }
    notify("Blocks saved.");
  };
  return (
    <section>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Case Studies</h2>
        <Btn disabled={!project} onClick={add}>
          Add block
        </Btn>
      </div>
      <select
        className="mt-5 rounded border p-2"
        value={project}
        onChange={(e) => setProject(e.target.value)}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="mt-5 space-y-3">
        {blocks.map((b) => (
          <div key={b.id} className="rounded-xl bg-white p-4 shadow">
            <select
              value={b.block_type}
              onChange={(e) =>
                setBlocks(
                  blocks.map((x) => (x.id === b.id ? { ...x, block_type: e.target.value } : x)),
                )
              }
            >
              {[
                "heading",
                "richText",
                "quote",
                "callout",
                "outcomes",
                "decision",
                "image",
                "gallery",
                "comparison",
                "diagram",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <BlockFields
              block={b}
              notify={notify}
              change={(patch) =>
                setBlocks(
                  blocks.map((x) =>
                    x.id === b.id ? { ...x, payload: { ...x.payload, ...patch } } : x,
                  ),
                )
              }
            />
            <select
              value={b.status}
              onChange={(e) =>
                setBlocks(blocks.map((x) => (x.id === b.id ? { ...x, status: e.target.value } : x)))
              }
            >
              <option>draft</option>
              <option>published</option>
              <option>archived</option>
            </select>
            <div className="mt-3 flex gap-2">
              <button
                className="text-sm underline"
                disabled={b.display_order === 0}
                onClick={() =>
                  setBlocks(
                    blocks.map((x) =>
                      x.id === b.id
                        ? { ...x, display_order: x.display_order - 1 }
                        : x.display_order === b.display_order - 1
                          ? { ...x, display_order: x.display_order + 1 }
                          : x,
                    ),
                  )
                }
              >
                Move up
              </button>
              <button
                className="text-sm text-red-700 underline"
                onClick={() =>
                  setBlocks(
                    blocks
                      .filter((x) => x.id !== b.id)
                      .map((x, index) => ({ ...x, display_order: index })),
                  )
                }
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <Btn className="mt-4" onClick={() => void save()}>
        Save blocks
      </Btn>
    </section>
  );
}
function BlockFields({
  block,
  change,
  notify,
}: {
  block: Row;
  change: (patch: Row) => void;
  notify: (value: string) => void;
}) {
  const payload = block.payload ?? {};
  const text = (key: string) => String(payload[key] ?? "");
  const lines = (key: string) => (Array.isArray(payload[key]) ? payload[key].join("\n") : "");
  if (block.block_type === "heading")
    return (
      <label className="mt-3 block">
        Heading
        <Input value={text("text")} onChange={(e) => change({ text: e.target.value, level: 2 })} />
      </label>
    );
  if (block.block_type === "richText")
    return (
      <label className="mt-3 block">
        Text
        <Area value={text("body")} onChange={(e) => change({ body: e.target.value })} />
      </label>
    );
  if (block.block_type === "quote")
    return (
      <>
        <label className="mt-3 block">
          Quote
          <Area value={text("quote")} onChange={(e) => change({ quote: e.target.value })} />
        </label>
        <label className="mt-3 block">
          Attribution
          <Input
            value={text("attribution")}
            onChange={(e) => change({ attribution: e.target.value })}
          />
        </label>
      </>
    );
  if (block.block_type === "callout")
    return (
      <>
        <label className="mt-3 block">
          Title
          <Input value={text("title")} onChange={(e) => change({ title: e.target.value })} />
        </label>
        <label className="mt-3 block">
          Body
          <Area value={text("body")} onChange={(e) => change({ body: e.target.value })} />
        </label>
      </>
    );
  if (block.block_type === "outcomes")
    return (
      <label className="mt-3 block">
        Verified outcomes, one per line
        <Area
          value={lines("items")}
          onChange={(e) =>
            change({
              items: e.target.value
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean),
            })
          }
        />
      </label>
    );
  if (block.block_type === "decision")
    return (
      <label className="mt-3 block">
        Existing decision ID
        <Input
          value={text("decisionId")}
          onChange={(e) => change({ decisionId: e.target.value })}
        />
      </label>
    );
  if (block.block_type === "comparison")
    return (
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label>
          Before media ID
          <Input
            value={text("beforeMediaId")}
            onChange={(e) => change({ beforeMediaId: e.target.value })}
          />
        </label>
        <label>
          After media ID
          <Input
            value={text("afterMediaId")}
            onChange={(e) => change({ afterMediaId: e.target.value })}
          />
        </label>
        <DirectImageUpload
          label="Upload before image"
          notify={notify}
          onReady={(id) => change({ beforeMediaId: id })}
        />
        <DirectImageUpload
          label="Upload after image"
          notify={notify}
          onReady={(id) => change({ afterMediaId: id })}
        />
      </div>
    );
  if (block.block_type === "image" || block.block_type === "diagram")
    return (
      <>
        <label className="mt-3 block">
          Media ID
          <Input value={text("mediaId")} onChange={(e) => change({ mediaId: e.target.value })} />
        </label>
        <DirectImageUpload
          label="Upload image"
          notify={notify}
          onReady={(id) => change({ mediaId: id })}
        />
        <label className="mt-3 block">
          Caption or description
          <Area
            value={text("caption") || text("description")}
            onChange={(e) =>
              change(
                block.block_type === "diagram"
                  ? { description: e.target.value }
                  : { caption: e.target.value },
              )
            }
          />
        </label>
      </>
    );
  return (
    <label className="mt-3 block">
      Gallery media IDs, one per line
      <Area
        value={lines("mediaIds")}
        onChange={(e) =>
          change({
            mediaIds: e.target.value
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
          })
        }
      />
      <DirectImageUpload
        label="Upload gallery image"
        notify={notify}
        onReady={(id) =>
          change({ mediaIds: [...(Array.isArray(payload.mediaIds) ? payload.mediaIds : []), id] })
        }
      />
    </label>
  );
}
function Media({ notify }: { notify: (x: string) => void }) {
  const [rows, setRows] = useState<Row[]>([]),
    [file, setFile] = useState<File | null>(null),
    [alt, setAlt] = useState(""),
    [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const load = () =>
    supabase!
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  useEffect(() => {
    void load();
  }, []);
  const upload = async () => {
    if (!file) return;
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
      "video/mp4",
      "application/pdf",
    ];
    if (file.size > 52428800 || !allowed.includes(file.type))
      return notify("Unsupported file or file exceeds 50 MiB.");
    const id = crypto.randomUUID(),
      path = `drafts/${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: up } = await supabase!.storage
      .from("portfolio-private")
      .upload(path, file, { contentType: file.type });
    if (up) return notify(up.message);
    const media_type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "document";
    const { error } = await supabase!.from("media_assets").insert({
      id,
      bucket: "portfolio-private",
      storage_path: path,
      media_type,
      alt_text: alt,
      is_public: false,
    });
    notify(error ? error.message : "Draft uploaded.");
    void load();
  };
  const promote = async (id: string) => {
    const { error } = await supabase!.functions.invoke("promote-media", { body: { mediaId: id } });
    notify(error ? await edgeErrorMessage(error) : "Media promoted.");
    void load();
  };
  const remove = async (id: string) => {
    const { data, error } = await supabase!.functions.invoke("delete-media", {
      body: { mediaId: id },
    });
    if (error) {
      const response = error.context instanceof Response ? error.context : null;
      let detail = await edgeErrorMessage(error);
      if (response?.status === 409) {
        try {
          const body = await response.clone().json();
          const places = Array.isArray(body?.usages)
            ? body.usages
              .map((usage: Row) => `${usage.resource_type}: ${usage.resource_id}`)
              .join(", ")
            : "a project, case-study block, or resume";
          detail = `Image is in use (${places}) and cannot be deleted.`;
        } catch {
          detail = "Image is in use and cannot be deleted.";
        }
      }
      notify(detail);
    } else notify(data?.deleted ? "Image and storage object deleted." : "Unable to delete image.");
    setPendingDelete(null);
    void load();
  };
  return (
    <section>
      <h2 className="text-2xl font-semibold">Media Library</h2>
      <div className="mt-5 rounded-xl bg-white p-5 shadow">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Input placeholder="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <Btn className="mt-3" disabled={!file} onClick={() => void upload()}>
          Upload draft
        </Btn>
      </div>
      <div className="mt-5 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex justify-between rounded-xl bg-white p-4 shadow">
            <span>
              {r.alt_text || "Untitled"} <small>{r.bucket}</small>
            </span>
            <div className="flex gap-2">
              {!r.is_public && <Btn onClick={() => void promote(r.id)}>Promote</Btn>}
              <Btn className="bg-red-700" onClick={() => setPendingDelete(r.id)}>
                Delete
              </Btn>
            </div>
            {pendingDelete === r.id && (
              <div className="mt-3 w-full rounded border border-red-200 bg-red-50 p-3 text-sm">
                Delete this unused image permanently?
                <div className="mt-2 flex gap-2">
                  <Btn className="bg-red-700" onClick={() => void remove(r.id)}>
                    Confirm delete
                  </Btn>
                  <Btn className="bg-slate-500" onClick={() => setPendingDelete(null)}>
                    Cancel
                  </Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
function Expertise({ notify }: { notify: (x: string) => void }) {
  const [rows, setRows] = useState<Row[]>([]),
    [edit, setEdit] = useState<Row | null>(null);
  const load = () =>
    void supabase!
      .from("expertise_entries")
      .select("*")
      .order("display_order")
      .then(({ data, error }) => {
        if (error) notify(error.message);
        else setRows(data ?? []);
      });
  useEffect(() => {
    load();
  }, []);
  const save = async () => {
    if (!edit) return;
    const row = {
      ...edit,
      id: edit.id || crypto.randomUUID(),
      details: Array.isArray(edit.details)
        ? edit.details
        : String(edit.details ?? "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      published_at:
        edit.status === "published" ? edit.published_at || new Date().toISOString() : null,
    };
    const { error } = await supabase!.from("expertise_entries").upsert(row);
    if (error) return notify(error.message);
    notify("Expertise entry saved.");
    setEdit(null);
    load();
  };
  return (
    <section>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Expertise</h2>
        <Btn
          onClick={() =>
            setEdit({
              id: "",
              title: "",
              short_label: "",
              body: "",
              details: [],
              display_order: rows.length,
              status: "draft",
            })
          }
        >
          New entry
        </Btn>
      </div>
      {edit && (
        <div className="mt-5 grid gap-3 rounded-xl bg-white p-5 shadow md:grid-cols-2">
          <label>
            Title
            <Input
              value={edit.title}
              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
            />
          </label>
          <label>
            Short label
            <Input
              value={edit.short_label}
              onChange={(e) => setEdit({ ...edit, short_label: e.target.value })}
            />
          </label>
          <label className="md:col-span-2">
            Description
            <Area value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
          </label>
          <label>
            Details, one per line
            <Area
              value={(edit.details ?? []).join("\n")}
              onChange={(e) => setEdit({ ...edit, details: e.target.value })}
            />
          </label>
          <label>
            Order
            <Input
              type="number"
              value={edit.display_order}
              onChange={(e) => setEdit({ ...edit, display_order: Number(e.target.value) })}
            />
          </label>
          <label>
            Status
            <select
              className="mt-1 w-full rounded border p-2"
              value={edit.status}
              onChange={(e) => setEdit({ ...edit, status: e.target.value })}
            >
              <option>draft</option>
              <option>published</option>
              <option>archived</option>
            </select>
          </label>
          <div className="flex gap-2">
            <Btn onClick={() => void save()}>Save</Btn>
            <Btn className="bg-slate-500" onClick={() => setEdit(null)}>
              Cancel
            </Btn>
          </div>
        </div>
      )}
      <div className="mt-5 space-y-2">
        {rows.map((row) => (
          <button
            key={row.id}
            className="block w-full rounded-xl bg-white p-4 text-left shadow"
            onClick={() => setEdit(row)}
          >
            <b>{row.title}</b> <small>{row.status}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
function Experience({ notify }: { notify: (x: string) => void }) {
  const [rows, setRows] = useState<Row[]>([]),
    [edit, setEdit] = useState<Row | null>(null);
  const load = () =>
    supabase!
      .from("experience_entries")
      .select("*")
      .order("display_order")
      .then(({ data }) => setRows(data ?? []));
  useEffect(() => {
    void load();
  }, []);
  const save = async () => {
    if (!edit) return;
    const { error } = await supabase!.from("experience_entries").upsert({
      ...edit,
      id: edit.id || crypto.randomUUID(),
      published_at:
        edit.status === "published" ? edit.published_at || new Date().toISOString() : null,
    });
    notify(error ? error.message : "Experience saved.");
    if (!error) {
      setEdit(null);
      void load();
    }
  };
  return (
    <section>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Experience</h2>
        <Btn
          onClick={() =>
            setEdit({
              id: "",
              organization: "",
              role: "",
              context: "",
              summary: "",
              display_order: rows.length,
              status: "draft",
            })
          }
        >
          New entry
        </Btn>
      </div>
      {edit && (
        <div className="mt-5 space-y-3 rounded-xl bg-white p-5 shadow">
          {["organization", "role", "context"].map((k) => (
            <Input
              key={k}
              placeholder={k}
              value={edit[k]}
              onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
            />
          ))}
          <Area
            placeholder="Summary"
            value={edit.summary}
            onChange={(e) => setEdit({ ...edit, summary: e.target.value })}
          />
          <Input
            type="number"
            value={edit.display_order}
            onChange={(e) => setEdit({ ...edit, display_order: Number(e.target.value) })}
          />
          <select
            value={edit.status}
            onChange={(e) => setEdit({ ...edit, status: e.target.value })}
          >
            <option>draft</option>
            <option>published</option>
            <option>archived</option>
          </select>
          <Btn onClick={() => void save()}>Save</Btn>
        </div>
      )}
      <div className="mt-5 space-y-2">
        {rows.map((r) => (
          <button
            key={r.id}
            className="block w-full rounded-xl bg-white p-4 text-left shadow"
            onClick={() => setEdit(r)}
          >
            <b>{r.organization}</b> <small>{r.status}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
