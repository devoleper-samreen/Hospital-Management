export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={40} strokeWidth={1.5} />}
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
