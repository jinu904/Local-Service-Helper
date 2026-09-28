const ICONS = {
  plumbing: (
    <path d="M14 4l6 6-3 3-6-6zM3 21l6-2 8-8-4-4-8 8-2 6z" />
  ),
  electrical: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
  cleaning: (
    <path d="M11 2v6M7 4l2 2M17 4l-2 2M12 22c4-4 7-7.5 7-11a7 7 0 10-14 0c0 3.5 3 7 7 11z" />
  ),
  carpentry: (
    <path d="M2 22l7-7M14.5 2.5l7 7-3 3-7-7 3-3zM11.5 5.5l-7 7 3 3 7-7-3-3z" />
  ),
  repair: (
    <path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2-2 2.5-2.5z" />
  ),
  painting: (
    <path d="M18 3H6a2 2 0 00-2 2v4a2 2 0 002 2h1v9a2 2 0 002 2h2a2 2 0 002-2v-9h1a2 2 0 002-2V5a2 2 0 00-2-2z" />
  ),
};

const CLASS_MAP = {
  plumbing: "plumbing-icon",
  electrical: "electrical-icon",
  cleaning: "cleaning-icon",
  carpentry: "carpentry-icon",
  repair: "repair-icon",
  painting: "painting-icon",
};

export default function ServiceIcon({ icon }) {
  return (
    <div className={`service-icon ${CLASS_MAP[icon] || ""}`}>
      <svg viewBox="0 0 24 24">{ICONS[icon]}</svg>
    </div>
  );
}
