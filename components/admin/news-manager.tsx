"use client";

import { useState } from "react";
import { createNews, deleteNews } from "@/app/actions/admin";
import { AdminForm, Field, FileField } from "@/components/admin/admin-form";
import { IconNews } from "@/components/ui/icons";

type NewsItem = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
};

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes("/news/video/");
}

export function NewsManager({ news }: { news: NewsItem[] }) {
  const [section, setSection] = useState<"create" | "published">("create");
  const withMedia = news.filter((n) => n.imageUrl || n.videoUrl).length;

  return (
    <div className="space-y-6">
      <section className="home-cover fade-up relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6">
        <div className="home-cover-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-[1] space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-purple-soft uppercase">
                Broadcast
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                News
              </h1>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Publish updates with photos or video for every student.
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-purple-soft">
              <IconNews className="h-6 w-6" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <SummaryChip label="Published" value={news.length} />
            <SummaryChip label="With media" value={withMedia} />
            <SummaryChip
              label="Text only"
              value={Math.max(0, news.length - withMedia)}
            />
          </div>
        </div>
      </section>

      <section className="glass-strong fade-up fade-up-delay-1 overflow-hidden rounded-3xl">
        <div className="flex border-b border-white/10">
          {(
            [
              { id: "create", label: "Create" },
              {
                id: "published",
                label:
                  news.length > 0 ? `Published (${news.length})` : "Published",
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={`flex-1 px-3 py-3 text-sm font-semibold transition ${
                section === tab.id
                  ? "border-b-2 border-purple text-purple-soft"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {section === "create" ? (
            <div className="mx-auto max-w-xl">
              <AdminForm action={createNews} submitLabel="Publish news">
                <Field
                  label="Headline"
                  name="title"
                  required
                  placeholder="Week 3 update"
                />
                <Field
                  label="Body"
                  name="body"
                  required
                  rows={4}
                  placeholder="Share updates every student should see…"
                />
                <FileField label="Photo" name="image" accept="image/*" />
                <FileField label="Video file" name="video" accept="video/*" />
                <Field
                  label="Or video link (optional)"
                  name="videoUrl"
                  placeholder="https://…"
                />
              </AdminForm>
            </div>
          ) : news.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No news posted yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="glass overflow-hidden rounded-2xl"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="aspect-[16/9] w-full bg-white/5 object-cover"
                    />
                  ) : null}

                  {item.videoUrl ? (
                    <div className="bg-black/40 p-3">
                      {isDirectVideo(item.videoUrl) ? (
                        <video
                          src={item.videoUrl}
                          controls
                          className="max-h-56 w-full rounded-xl"
                        />
                      ) : (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-purple-soft underline"
                        >
                          Open video link
                        </a>
                      )}
                    </div>
                  ) : null}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium tracking-wider text-purple-soft uppercase">
                          News
                        </p>
                        <h3 className="mt-1 font-medium text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-muted">
                          {item.body}
                        </p>
                        <p className="mt-2 text-[10px] text-muted">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <form action={deleteNews.bind(null, item.id)}>
                        <button type="submit" className="text-xs text-red">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="home-cover-chip rounded-2xl px-2 py-3 text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
