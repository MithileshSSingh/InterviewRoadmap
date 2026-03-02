const TYPE_ICONS = {
  video: "▶️",
  article: "📄",
  course: "🎓",
  practice: "💻",
  book: "📗",
  repo: "🔗",
  docs: "📖",
};

export default function ResourceList({ resources = [] }) {
  if (!resources.length) return null;

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {resources.map((res, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.82rem",
          }}
        >
          <span>{TYPE_ICONS[res.type] ?? "📎"}</span>
          {res.url ? (
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-blue)", textDecoration: "none", flex: 1 }}
            >
              {res.title}
            </a>
          ) : (
            <span style={{ flex: 1, color: "var(--text-primary)" }}>{res.title}</span>
          )}
          <span
            style={{
              fontSize: "0.65rem",
              padding: "0.1rem 0.4rem",
              borderRadius: 999,
              background: res.free ? "var(--accent-blue)22" : "#f59e0b22",
              color: res.free ? "var(--accent-blue)" : "#f59e0b",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {res.free ? "Free" : "Paid"}
          </span>
          {res.problemCount && (
            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
              {res.problemCount} problems
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
