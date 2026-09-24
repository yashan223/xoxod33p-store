import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireAdmin } from "@/server/auth/admin";
import { listAdminMessageThreads } from "@/server/orders/orders";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdmin();
  const threads = await listAdminMessageThreads();
  const withUnread = threads.filter((thread) => thread.unreadCount > 0);

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Customer conversations</span>
          <h1>Messages</h1>
          <p>
            Review customer requests, questions, and payment follow-ups across every order chat.
          </p>
        </div>
        <span className="admin-date">{threads.length} THREADS</span>
      </div>

      <section className="admin-panel admin-threads-panel">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Inbox</span>
            <h2>Order chats</h2>
          </div>
          <span className="admin-panel-meta">
            {withUnread.length} with unread customer messages
          </span>
        </div>

        {threads.length === 0 ? (
          <p className="admin-empty">
            <MessageCircle
              size={18}
              style={{ display: "inline", marginRight: 8, verticalAlign: -3 }}
            />
            No customer orders yet — threads appear here once orders are placed.
          </p>
        ) : (
          <div className="admin-threads">
            {threads.map((thread) => (
              <article
                className={`admin-thread ${thread.unreadCount > 0 ? "unread" : ""}`}
                key={thread.orderId}
              >
                <div className="admin-thread-main">
                  <span className="profile-order-id">{thread.orderId}</span>
                  <strong>{thread.email}</strong>
                  {thread.latestMessage ? (
                    <p>{thread.latestMessage.body}</p>
                  ) : (
                    <p className="admin-thread-muted">No customer messages in this thread yet.</p>
                  )}
                </div>
                <div className="admin-thread-side">
                  <span className="admin-status">{thread.status.replace("_", " ")}</span>
                  {thread.latestMessage && (
                    <small>
                      {new Date(thread.latestMessage.createdAt).toLocaleDateString("en-LK")}
                    </small>
                  )}
                  {thread.unreadCount > 0 && (
                    <span className="admin-thread-badge">
                      {thread.unreadCount > 9 ? "9+" : thread.unreadCount}
                    </span>
                  )}
                  <Link className="profile-order-link" href={`/admin/orders/${thread.orderId}`}>
                    Open chat
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
