export default function StreakRing({
  count,
  done,
  total,
}: {
  count: number
  done: number
  total: number
}) {
  return (
    <div className="streak">
      <div className="ring">
        <svg width="74" height="74">
          <circle cx="37" cy="37" r="32" fill="none" stroke="rgba(139,148,167,.2)" strokeWidth="4" />
          <circle
            cx="37"
            cy="37"
            r="32"
            fill="none"
            stroke="#C9A227"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="201"
            strokeDashoffset={201 - (201 * done) / total}
          />
        </svg>
        <div className="num">
          <b>{count}</b>
          <span>day streak</span>
        </div>
      </div>
      <div className="streak-label">
        "The most beloved deeds to Allah are the <b>most consistent</b>, even if small." — Bukhari
        &amp; Muslim
      </div>
    </div>
  )
}
