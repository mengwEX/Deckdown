import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileCode2,
  FilePlus2,
  FolderOpen,
  Maximize2,
  Play,
  Save,
  SkipBack,
  SkipForward,
  X
} from "lucide-react";
import { compileDeckStyles } from "@deckdown/compiler";
import { parseDeckdown } from "@deckdown/parser";
import { addSlideRootClass, createStandaloneHtml, sanitizeSlideHtml } from "@deckdown/renderer";
import { Diagnostic, hasErrors } from "@deckdown/schema";
import { sampleDeck } from "./sample";

export function App() {
  const [source, setSource] = useState(sampleDeck);
  const [fileName, setFileName] = useState("chordedit.dd");
  const [css, setCss] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [presenting, setPresenting] = useState(false);
  const [presenterScale, setPresenterScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const presenterViewportRef = useRef<HTMLDivElement>(null);
  const presenterStageRef = useRef<HTMLDivElement>(null);

  const deck = useMemo(() => parseDeckdown(source), [source]);
  const currentSlide = deck.slides[Math.min(slideIndex, Math.max(deck.slides.length - 1, 0))];
  const highlightedSource = useMemo(() => highlightDeckSource(source), [source]);

  useEffect(() => {
    let cancelled = false;
    compileDeckStyles(deck).then((result) => {
      if (!cancelled) setCss(result.css);
    });
    return () => {
      cancelled = true;
    };
  }, [deck]);

  useEffect(() => {
    setSlideIndex((index) => Math.min(index, Math.max(deck.slides.length - 1, 0)));
  }, [deck.slides.length]);

  useEffect(() => {
    const resize = () => {
      const stage = stageRef.current;
      const viewport = viewportRef.current;
      if (!stage || !viewport) return;
      const rect = viewport.getBoundingClientRect();
      const nextScale = Math.min(rect.width / deck.frontmatter.size.width, rect.height / deck.frontmatter.size.height, 1);
      setScale(nextScale);
      stage.style.transform = `scale(${nextScale})`;
      stage.style.width = `${deck.frontmatter.size.width}px`;
      stage.style.height = `${deck.frontmatter.size.height}px`;
    };
    resize();
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, [deck.frontmatter.size.height, deck.frontmatter.size.width, currentSlide]);

  useEffect(() => {
    const resizePresenter = () => {
      const viewport = presenterViewportRef.current;
      const stage = presenterStageRef.current;
      if (!viewport || !stage) return;
      const rect = viewport.getBoundingClientRect();
      const nextScale = Math.min(rect.width / deck.frontmatter.size.width, rect.height / deck.frontmatter.size.height);
      setPresenterScale(nextScale);
      stage.style.transform = `scale(${nextScale})`;
      stage.style.width = `${deck.frontmatter.size.width}px`;
      stage.style.height = `${deck.frontmatter.size.height}px`;
    };
    resizePresenter();
    addEventListener("resize", resizePresenter);
    return () => removeEventListener("resize", resizePresenter);
  }, [deck.frontmatter.size.height, deck.frontmatter.size.width, presenting, currentSlide]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && presenting) {
        setPresenting(false);
        if (document.fullscreenElement) void document.exitFullscreen();
        return;
      }
      if (!presenting && ["ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(event.key)) return;
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        setSlideIndex((index) => Math.min(index + 1, deck.slides.length - 1));
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setSlideIndex((index) => Math.max(index - 1, 0));
      }
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, [deck.slides.length, presenting]);

  const diagnostics = deck.diagnostics;
  const invalid = hasErrors(diagnostics);
  const renderedSlide = currentSlide ? renderSlideHtml(currentSlide.html) : "";

  const syncEditorScroll = () => {
    if (!editorRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = editorRef.current.scrollTop;
    highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
  };

  const enterPresenter = async (fullscreen: boolean) => {
    setPresenting(true);
    if (fullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen may be blocked by the host WebView. The presenter overlay still works.
      }
    }
  };

  return (
    <div className="app">
      <style>{css}</style>
      <header className="fileBar">
        <div className="brand">
          <span className="brandMark">D</span>
          <strong>Deckdown</strong>
        </div>
        <div className="fileTabs" aria-label="Open files">
          <button className="fileTab active">
            <FileCode2 size={15} />
            <span>{fileName}</span>
          </button>
        </div>
        <span className={invalid ? "deckState bad" : "deckState good"}>
          {invalid ? <AlertTriangle size={15} /> : <FileCode2 size={15} />}
          {invalid ? "Invalid" : "Valid"}
        </span>
      </header>

      <header className="topbar">
        <div className="fileTools">
          <button
            className="textButton"
            onClick={() => {
              setSource(sampleDeck);
              setFileName("untitled.dd");
            }}
          >
            <FilePlus2 size={16} />
            New
          </button>
          <label className="textButton">
            <FolderOpen size={16} />
            Open
            <input type="file" accept=".dd,text/plain" onChange={(event) => openFile(event, setSource, setFileName)} />
          </label>
          <button className="textButton" onClick={() => downloadSource(source, deck.frontmatter.title)}>
            <Save size={16} />
            Save .dd
          </button>
          <button className="textButton" onClick={() => downloadHtml(deck, css)}>
            <Download size={16} />
            Export HTML
          </button>
        </div>
        <div className="deckMeta">
          <strong>{deck.frontmatter.title}</strong>
          <span>
            {deck.frontmatter.size.width}x{deck.frontmatter.size.height} · {deck.slides.length} slides
          </span>
        </div>
        <div className="navTools">
          <button onClick={() => enterPresenter(false)} aria-label="Play slideshow" title="Play slideshow">
            <Play size={18} />
          </button>
          <button onClick={() => setSlideIndex(Math.max(slideIndex - 1, 0))} aria-label="Previous slide">
            <SkipBack size={18} />
          </button>
          <span>
            {deck.slides.length ? slideIndex + 1 : 0} / {deck.slides.length}
          </span>
          <button onClick={() => setSlideIndex(Math.min(slideIndex + 1, deck.slides.length - 1))} aria-label="Next slide">
            <SkipForward size={18} />
          </button>
          <button onClick={() => enterPresenter(true)} aria-label="Fullscreen slideshow" title="Fullscreen slideshow">
            <Maximize2 size={18} />
          </button>
        </div>
      </header>

      <main className="workArea">
        <section className="sourceColumn">
          <div className="panelHeader">
            <strong>Source</strong>
            <span>.dd</span>
          </div>
          <div className="editorPane">
            <pre ref={highlightRef} className="sourceHighlight" aria-hidden="true">
              {highlightedSource}
            </pre>
            <textarea
              ref={editorRef}
              value={source}
              spellCheck={false}
              onScroll={syncEditorScroll}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>
        </section>

        <aside className="thumbnailColumn">
          <div className="panelHeader">
            <strong>Slides</strong>
            <span>{deck.slides.length}</span>
          </div>
          <nav className="thumbList" aria-label="Slides">
            {deck.slides.map((slide, index) => (
              <button
                key={slide.id}
                className={`thumbTab ${index === slideIndex ? "active" : ""}`}
                onClick={() => setSlideIndex(index)}
              >
                <span className="thumbNumber">{String(index + 1).padStart(2, "0")}</span>
                <div className="thumbViewport">
                  <div className="thumbStage" dangerouslySetInnerHTML={{ __html: renderSlideHtml(slide.html) }} />
                </div>
                <strong>{slide.id}</strong>
              </button>
            ))}
          </nav>
        </aside>

        <section className="previewColumn">
          <div className="panelHeader">
            <strong>Preview</strong>
            <span>{currentSlide?.id ?? "No slide"}</span>
          </div>
          <div className="previewPane" ref={viewportRef}>
            <div
              className="stageFrame"
              style={{
                width: deck.frontmatter.size.width * scale,
                height: deck.frontmatter.size.height * scale
              }}
            >
              <div className="stage" ref={stageRef}>
                {currentSlide ? (
                  <div dangerouslySetInnerHTML={{ __html: renderedSlide }} />
                ) : (
                  <div className="empty">No slides</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="statusBar">
        <Diagnostics diagnostics={diagnostics} />
      </footer>
      {presenting ? (
        <div className="presenter">
          <div className="presenterBar">
            <strong>{deck.frontmatter.title}</strong>
            <span>
              {deck.slides.length ? slideIndex + 1 : 0} / {deck.slides.length}
            </span>
            <button
              onClick={() => {
                setPresenting(false);
                if (document.fullscreenElement) void document.exitFullscreen();
              }}
              aria-label="Close presenter"
            >
              <X size={20} />
            </button>
          </div>
          <div className="presenterViewport" ref={presenterViewportRef}>
            <div
              className="presenterFrame"
              style={{
                width: deck.frontmatter.size.width * presenterScale,
                height: deck.frontmatter.size.height * presenterScale
              }}
            >
              <div className="presenterStage" ref={presenterStageRef}>
                {currentSlide ? <div dangerouslySetInnerHTML={{ __html: renderedSlide }} /> : <div className="empty">No slides</div>}
              </div>
            </div>
          </div>
          <div className="presenterControls">
            <button onClick={() => setSlideIndex(Math.max(slideIndex - 1, 0))}>
              <SkipBack size={18} />
              Previous
            </button>
            <button onClick={() => setSlideIndex(Math.min(slideIndex + 1, deck.slides.length - 1))}>
              Next
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Diagnostics({ diagnostics }: { diagnostics: Diagnostic[] }) {
  return (
    <section className="diagnostics">
      <strong>Diagnostics</strong>
      {diagnostics.length === 0 ? (
        <p>No issues.</p>
      ) : (
        <ul>
          {diagnostics.map((diagnostic, index) => (
            <li key={`${diagnostic.code}-${index}`} className={diagnostic.severity}>
              <span>{diagnostic.severity}</span>
              <p>{diagnostic.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function openFile(
  event: React.ChangeEvent<HTMLInputElement>,
  setSource: (source: string) => void,
  setFileName: (name: string) => void
) {
  const file = event.target.files?.[0];
  if (!file) return;
  setSource(await file.text());
  setFileName(file.name);
  event.target.value = "";
}

function downloadSource(source: string, title: string) {
  downloadBlob(new Blob([source], { type: "text/plain;charset=utf-8" }), `${slug(title)}.dd`);
}

function downloadHtml(deck: ReturnType<typeof parseDeckdown>, css: string) {
  const html = createStandaloneHtml(deck, css, { includeNavigation: true });
  downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `${slug(deck.frontmatter.title)}.html`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 300);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deck";
}

function renderSlideHtml(html: string) {
  return addSlideRootClass(sanitizeSlideHtml(html));
}

function highlightDeckSource(source: string) {
  const lines = source.split("\n");
  let inFrontmatter = false;
  return lines.flatMap((line, index) => {
    const parts: React.ReactNode[] = [];
    const key = `line-${index}`;
    if (line.trim() === "---") {
      inFrontmatter = !inFrontmatter;
      parts.push(
        <span key={`${key}-yaml-boundary`} className="tokYamlBoundary">
          {line}
        </span>
      );
    } else if (inFrontmatter) {
      const match = line.match(/^(\s*[\w-]+)(:\s*)(.*)$/);
      if (match) {
        parts.push(
          <span key={`${key}-yaml-key`} className="tokYamlKey">
            {match[1]}
          </span>,
          <span key={`${key}-yaml-colon`} className="tokMuted">
            {match[2]}
          </span>,
          <span key={`${key}-yaml-value`} className="tokYamlValue">
            {match[3]}
          </span>
        );
      } else {
        parts.push(escapeAsText(line, key));
      }
    } else if (/^:::slide\b/.test(line) || line.trim() === ":::") {
      parts.push(
        <span key={`${key}-block`} className="tokBlock">
          {line}
        </span>
      );
    } else {
      parts.push(...highlightHtmlLine(line, key));
    }
    return [...parts, "\n"];
  });
}

function highlightHtmlLine(line: string, key: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(<\/?[\w-]+|\/?>|\bclass=)(?=(?:(?:[^"]*"){2})*[^"]*$)|"[^"]*"|'[^']*'/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line))) {
    if (match.index > lastIndex) nodes.push(escapeAsText(line.slice(lastIndex, match.index), `${key}-${lastIndex}`));
    const value = match[0];
    const className = value.startsWith("<") || value === ">" || value === "/>" ? "tokTag" : value === "class=" ? "tokAttr" : "tokString";
    nodes.push(
      <span key={`${key}-${match.index}`} className={className}>
        {value}
      </span>
    );
    lastIndex = match.index + value.length;
  }
  if (lastIndex < line.length) nodes.push(escapeAsText(line.slice(lastIndex), `${key}-${lastIndex}`));
  return nodes;
}

function escapeAsText(value: string, key: string) {
  return <span key={key}>{value}</span>;
}
