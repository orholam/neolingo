function HeartsDisplay({ hearts, maxHearts = 5 }) {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxHearts)].map((_, i) => (
        <span key={i} className="text-2xl">
          {i < hearts ? '❤️' : '🤍'}
        </span>
      ))}
    </div>
  )
}

export default HeartsDisplay



