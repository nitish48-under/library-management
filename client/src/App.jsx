import { useEffect, useMemo, useState } from "react";
const API = "http://localhost:5000/api";
export default function App() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ title: "", author: "", isbn: "", totalCopies: 1 });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  async function load() {
    try {
      const r = await fetch(`${API}/books?q=${encodeURIComponent(query)}`);
      setBooks(await r.json());
    } catch { setMessage("Cannot reach API. Start the backend first."); }
  }
  useEffect(() => { load(); }, [query]);
  const available = useMemo(() => books.reduce((n, b) => n + b.availableCopies, 0), [books]);
  const total = useMemo(() => books.reduce((n, b) => n + b.totalCopies, 0), [books]);
  async function submit(e) {
    e.preventDefault(); setMessage("");
    const url = editing ? `${API}/books/${editing}` : `${API}/books`;
    const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await r.json();
    if (!r.ok) return setMessage(data.message || "Something went wrong");
    setForm({ title: "", author: "", isbn: "", totalCopies: 1 }); setEditing(null);
    setMessage(editing ? "Book updated." : "Book added."); load();
  }
  async function action(id, kind) {
    const r = await fetch(`${API}/books/${id}/${kind}`, { method: "PATCH" });
    const data = await r.json(); setMessage(r.ok ? `Book ${kind === "issue" ? "issued" : "returned"}.` : data.message); load();
  }
  async function remove(id) {
    if (!confirm("Delete this book?")) return;
    const r = await fetch(`${API}/books/${id}`, { method: "DELETE" });
    const data = await r.json(); setMessage(data.message); load();
  }
  function edit(b) { setEditing(b._id); setForm({ title: b.title, author: b.author, isbn: b.isbn, totalCopies: b.totalCopies }); }
  return <main>
    <header><div><p className="eyebrow">LIBRARY MANAGEMENT SYSTEM</p><h1>Your library, <span>organized.</span></h1><p className="sub">Manage books, track availability, and handle issue/return operations.</p></div><div className="mark">LM</div></header>
    <section className="stats">
      <article><small>BOOK TITLES</small><strong>{books.length}</strong></article>
      <article><small>TOTAL COPIES</small><strong>{total}</strong></article>
      <article><small>AVAILABLE COPIES</small><strong>{available}</strong></article>
    </section>
    <section className="panel">
      <h2>{editing ? "Update book" : "Add a book"}</h2>
      <form onSubmit={submit} className="form">
        <input placeholder="Book title" required value={form.title} onChange={e => setForm({...form,title:e.target.value})}/>
        <input placeholder="Author" required value={form.author} onChange={e => setForm({...form,author:e.target.value})}/>
        <input placeholder="ISBN (optional)" value={form.isbn} onChange={e => setForm({...form,isbn:e.target.value})}/>
        <input type="number" min="1" required placeholder="Copies" value={form.totalCopies} onChange={e => setForm({...form,totalCopies:e.target.value})}/>
        <button>{editing ? "Save changes" : "Add book"}</button>
        {editing && <button type="button" className="secondary" onClick={() => {setEditing(null);setForm({title:"",author:"",isbn:"",totalCopies:1})}}>Cancel</button>}
      </form>
      {message && <p className="message">{message}</p>}
    </section>
    <section className="panel">
      <div className="listhead"><div><h2>Book collection</h2><p className="sub">Search and manage your catalogue</p></div><input className="search" placeholder="Search title or author..." value={query} onChange={e => setQuery(e.target.value)}/></div>
      <div className="tablewrap"><table><thead><tr><th>BOOK</th><th>AUTHOR</th><th>ISBN</th><th>AVAILABLE</th><th>ACTIONS</th></tr></thead>
      <tbody>{books.map(b => <tr key={b._id}><td><b>{b.title}</b></td><td>{b.author}</td><td>{b.isbn || "—"}</td><td><span className={b.availableCopies ? "pill" : "pill out"}>{b.availableCopies}/{b.totalCopies}</span></td><td className="actions"><button className="small" disabled={!b.availableCopies} onClick={() => action(b._id,"issue")}>Issue</button><button className="small secondary" disabled={b.availableCopies===b.totalCopies} onClick={() => action(b._id,"return")}>Return</button><button className="small secondary" onClick={() => edit(b)}>Edit</button><button className="small danger" onClick={() => remove(b._id)}>Delete</button></td></tr>)}
      {!books.length && <tr><td colSpan="5" className="empty">No books found. Add your first book above.</td></tr>}</tbody></table></div>
    </section>
    <footer>Library Management System · Full-stack CRUD project</footer>
  </main>;
}
