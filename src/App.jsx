import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:8080";

function App() {
  const [page, setPage] = useState("welcome");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("lostFoundUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [showReport, setShowReport] = useState(false);
  const [showClaim, setShowClaim] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [notifications, setNotifications] = useState(false);

  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    type: "LOST",
    image: ""
  });

  const [claimForm, setClaimForm] = useState({
    claimantName: "",
    claimantEmail: "",
    proof: ""
  });

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = async () => {
    try {
      setLoading(true);

      const [itemRes, claimRes] = await Promise.all([
        fetch(`${API}/items`),
        fetch(`${API}/api/claims`)
      ]);

      if (itemRes.ok) setItems(await itemRes.json());
      if (claimRes.ok) setClaims(await claimRes.json());

      if (user?.role === "ADMIN") {
        const dashboardRes = await fetch(`${API}/admin/dashboard`);
        if (dashboardRes.ok) setStats(await dashboardRes.json());

        const usersRes = await fetch(`${API}/users`);
        if (usersRes.ok) setUsers(await usersRes.json());
      }
    } catch (error) {
      console.error("Loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();

      if (user.role === "ADMIN") {
        setPage("admin");
      } else {
        setPage("dashboard");
      }
    }
  }, [user]);

  /* =====================================================
     AUTH
  ===================================================== */

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        authMode === "login"
          ? `${API}/users/login`
          : `${API}/users/register`;

      const body =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password
            }
          : authForm;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const message = await response.text();
        alert(message || "Authentication failed");
        return;
      }

      const data = await response.json();

      localStorage.setItem("lostFoundUser", JSON.stringify(data));
      setUser(data);

      setAuthForm({
        name: "",
        email: "",
        password: ""
      });
    } catch (error) {
      alert("Cannot connect to Spring Boot server.");
      console.error(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("lostFoundUser");
    setUser(null);
    setPage("welcome");
  };

  /* =====================================================
     IMAGE UPLOAD
  ===================================================== */

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setReportForm((prev) => ({
        ...prev,
        image: reader.result
      }));
    };

    reader.readAsDataURL(file);
  };

  /* =====================================================
     REPORT ITEM
  ===================================================== */

  const submitReport = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      const item = {
        title: reportForm.title,
        description: reportForm.description,
        category: reportForm.category,
        location: reportForm.location,
        date: reportForm.date,
        type: reportForm.type,
        status: "ACTIVE",
        image: reportForm.image,
        reporterEmail: user.email
      };

      const response = await fetch(`${API}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        alert("Could not report item.");
        return;
      }

      alert("Item reported successfully!");

      setShowReport(false);

      setReportForm({
        title: "",
        description: "",
        category: "",
        location: "",
        date: "",
        type: "LOST",
        image: ""
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Server connection failed.");
    }
  };

  /* =====================================================
     CLAIM ITEM
  ===================================================== */

  const openClaim = (item) => {
    setShowClaim(item);

    setClaimForm({
      claimantName: user?.name || "",
      claimantEmail: user?.email || "",
      proof: ""
    });
  };

  const submitClaim = async (e) => {
    e.preventDefault();

    if (!showClaim) return;

    try {
      const response = await fetch(`${API}/api/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemId: showClaim.id,
          claimantName: claimForm.claimantName,
          claimantEmail: claimForm.claimantEmail,
          proof: claimForm.proof,
          status: "PENDING"
        })
      });

      if (!response.ok) {
        alert("Could not submit claim.");
        return;
      }

      alert("Claim submitted successfully!");

      setShowClaim(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Server connection failed.");
    }
  };

  /* =====================================================
     ADMIN CLAIM STATUS
  ===================================================== */

  const updateClaim = async (claim, status) => {
    try {
      const response = await fetch(`${API}/api/claims/${claim.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemId: claim.itemId,
          claimantName: claim.claimantName,
          claimantEmail: claim.claimantEmail,
          proof: claim.proof,
          status
        })
      });

      if (!response.ok) {
        alert("Could not update claim.");
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Server connection failed.");
    }
  };

  /* =====================================================
     DELETE ITEM
  ===================================================== */

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const response = await fetch(`${API}/items/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await loadData();
      } else {
        alert("Could not delete item.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase()) ||
        item.location?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        item.type?.toUpperCase() === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  const myItems = items.filter(
    (item) =>
      item.reporterEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  const myClaims = claims.filter(
    (claim) =>
      claim.claimantEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  /* =====================================================
     HELPERS
  ===================================================== */

  const getReporterName = (email) => {
    const found = users.find(
      (u) => u.email?.toLowerCase() === email?.toLowerCase()
    );

    return found?.name || email || "Unknown";
  };

  const getItem = (id) => items.find((item) => item.id === id);

  /* =====================================================
     WELCOME PAGE
  ===================================================== */

  if (page === "welcome") {
    return (
      <div className="welcome-page">
        <div className="welcome-card">
          <div className="welcome-logo">🔎</div>

          <span className="welcome-tag">DIGITAL LOST & FOUND</span>

          <h1>
            Lost something?
            <br />
            <span>Let's find it.</span>
          </h1>

          <p>
            A simple digital platform for students to report lost items,
            register found items and safely claim belongings.
          </p>

          <button
            className="welcome-btn"
            onClick={() => {
              setPage("auth");
              setAuthMode("login");
            }}
          >
            Enter Platform →
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     AUTH PAGE
  ===================================================== */

  if (page === "auth") {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="brand-logo">🔎</div>

          <span className="eyebrow">DIGITAL LOST & FOUND</span>

          <h1>
            Find what matters.
            <br />
            <span>Return what doesn't.</span>
          </h1>

          <p>
            Report lost belongings, register found items and help your
            campus community reconnect with their possessions.
          </p>

          <div className="features">
            <div>✓ Easy lost & found reporting</div>
            <div>✓ Secure claim verification</div>
            <div>✓ Student-friendly dashboard</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>

            <button
              className={authMode === "register" ? "active" : ""}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          <h2>
            {authMode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="auth-subtitle">
            {authMode === "login"
              ? "Login to continue to your dashboard."
              : "Register as a student to get started."}
          </p>

          <form onSubmit={handleAuth}>
            {authMode === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      name: e.target.value
                    })
                  }
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    email: e.target.value
                  })
                }
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    password: e.target.value
                  })
                }
                placeholder="Enter password"
                required
              />
            </div>

            <button className="primary-btn full">
              {authMode === "login" ? "Login →" : "Create Account →"}
            </button>
          </form>

          <button
            className="back-link"
            onClick={() => setPage("welcome")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     ADMIN DASHBOARD
  ===================================================== */

  if (page === "admin") {
    return (
      <div className="app">
        <Navbar
          user={user}
          active="admin"
          setPage={setPage}
          logout={logout}
          notifications={notifications}
          setNotifications={setNotifications}
          pending={stats.pendingClaims || 0}
        />

        <main className="admin-page">
          <div className="page-heading">
            <div>
              <span className="eyebrow">ADMINISTRATION</span>
              <h1>Admin Dashboard</h1>
              <p>
                Monitor lost items, found items, students and claims.
              </p>
            </div>

            <button className="primary-btn" onClick={loadData}>
              ↻ Refresh
            </button>
          </div>

          <div className="admin-stats">
            <AdminStat
              icon="📦"
              title="Total Items"
              value={stats.totalItems ?? items.length}
            />
            <AdminStat
              icon="🔴"
              title="Lost Items"
              value={stats.lostItems ?? 0}
            />
            <AdminStat
              icon="🟢"
              title="Found Items"
              value={stats.foundItems ?? 0}
            />
            <AdminStat
              icon="📋"
              title="Total Claims"
              value={stats.totalClaims ?? claims.length}
            />
            <AdminStat
              icon="⏳"
              title="Pending Claims"
              value={stats.pendingClaims ?? 0}
            />
            <AdminStat
              icon="👥"
              title="Students"
              value={stats.totalUsers ?? users.length}
            />
          </div>

          <section className="admin-section">
            <div className="section-title">
              <div>
                <span className="eyebrow">REPORTS</span>
                <h2>All Lost & Found Items</h2>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Reporter</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-item">
                          {item.image ? (
                            <img src={item.image} alt="" />
                          ) : (
                            <div className="table-image">📦</div>
                          )}

                          <div>
                            <strong>{item.title}</strong>
                            <small>{item.category}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            item.type?.toLowerCase()
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {getReporterName(item.reporterEmail)}
                        </strong>
                        <small className="block">
                          {item.reporterEmail}
                        </small>
                      </td>

                      <td>{item.location}</td>
                      <td>{item.date}</td>

                      <td>
                        <span className="status active-status">
                          {item.status || "ACTIVE"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="small-btn"
                          onClick={() => setShowDetails(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No items reported yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <div className="section-title">
              <div>
                <span className="eyebrow">CLAIMS</span>
                <h2>Claim Approval</h2>
              </div>

              <span className="count-pill">
                {claims.length} claims
              </span>
            </div>

            <div className="claim-admin-grid">
              {claims.map((claim) => {
                const item = getItem(claim.itemId);

                return (
                  <div className="admin-claim-card" key={claim.id}>
                    <div className="claim-image">
                      {item?.image ? (
                        <img src={item.image} alt="" />
                      ) : (
                        "📦"
                      )}
                    </div>

                    <div className="claim-admin-content">
                      <div className="claim-top">
                        <span className="eyebrow">CLAIM #{claim.id}</span>

                        <span
                          className={`status ${claim.status?.toLowerCase()}`}
                        >
                          {claim.status}
                        </span>
                      </div>

                      <h3>{item?.title || `Item #${claim.itemId}`}</h3>

                      <div className="person-box">
                        <div className="person-avatar">
                          {claim.claimantName?.charAt(0) || "?"}
                        </div>

                        <div>
                          <strong>{claim.claimantName}</strong>
                          <small>{claim.claimantEmail}</small>
                        </div>
                      </div>

                      <div className="proof-box">
                        <strong>Proof provided</strong>
                        <p>{claim.proof || "No proof provided."}</p>
                      </div>

                      {claim.status === "PENDING" && (
                        <div className="claim-actions">
                          <button
                            className="approve-btn"
                            onClick={() =>
                              updateClaim(claim, "APPROVED")
                            }
                          >
                            ✓ Approve
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() =>
                              updateClaim(claim, "REJECTED")
                            }
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {claims.length === 0 && (
                <div className="empty-state">
                  <div>📋</div>
                  <h3>No claims yet</h3>
                  <p>Submitted claims will appear here.</p>
                </div>
              )}
            </div>
          </section>

          <section className="admin-section">
            <div className="section-title">
              <div>
                <span className="eyebrow">STUDENTS</span>
                <h2>Registered Students</h2>
              </div>
            </div>

            <div className="students-grid">
              {users.map((student) => (
                <div className="student-card" key={student.id}>
                  <div className="student-avatar">
                    {student.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.email}</p>
                    <span>{student.role}</span>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="empty-state">
                  <div>👥</div>
                  <h3>No student records</h3>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* =====================================================
     STUDENT DASHBOARD
  ===================================================== */

  return (
    <div className="app">
      <Navbar
        user={user}
        active="dashboard"
        setPage={setPage}
        logout={logout}
        notifications={notifications}
        setNotifications={setNotifications}
        pending={myClaims.filter((c) => c.status === "PENDING").length}
      />

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">WELCOME BACK</span>

            <h1>
              Hello, <span>{user?.name}</span> 👋
            </h1>

            <p>
              Find your lost belongings or help someone recover theirs.
            </p>

            <button
              className="primary-btn"
              onClick={() => setShowReport(true)}
            >
              + Report Lost / Found
            </button>
          </div>

          <div className="hero-art">
            <div className="hero-circle">🔎</div>
            <div className="float-card one">🎒 Lost</div>
            <div className="float-card two">📱 Found</div>
            <div className="float-card three">✓ Returned</div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon="📦"
            label="Total Items"
            value={items.length}
          />

          <StatCard
            icon="🔴"
            label="Lost"
            value={items.filter((i) => i.type === "LOST").length}
          />

          <StatCard
            icon="🟢"
            label="Found"
            value={items.filter((i) => i.type === "FOUND").length}
          />

          <StatCard
            icon="📋"
            label="My Claims"
            value={myClaims.length}
          />
        </section>

        <section className="content">
          <div className="section-title">
            <div>
              <span className="eyebrow">COMMUNITY</span>
              <h2>Lost & Found Items</h2>
              <p>Search for belongings reported by students.</p>
            </div>

            <button
              className="outline-btn"
              onClick={() => setShowReport(true)}
            >
              + Report Item
            </button>
          </div>

          <div className="search-area">
            <div className="search-box">
              🔎
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item, category or location..."
              />
            </div>

            <div className="filters">
              {["ALL", "LOST", "FOUND"].map((type) => (
                <button
                  key={type}
                  className={filter === type ? "selected" : ""}
                  onClick={() => setFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="items-grid">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                user={user}
                onView={() => setShowDetails(item)}
                onClaim={() => openClaim(item)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <div>🔍</div>
              <h3>No items found</h3>
              <p>Try another search or report an item.</p>
            </div>
          )}
        </section>

        <section className="content">
          <div className="section-title">
            <div>
              <span className="eyebrow">YOUR ACTIVITY</span>
              <h2>My Reports</h2>
            </div>
          </div>

          {myItems.length === 0 ? (
            <div className="empty-state">
              <div>📦</div>
              <h3>No reports yet</h3>
              <p>Items you report will appear here.</p>
            </div>
          ) : (
            <div className="my-items">
              {myItems.map((item) => (
                <div className="my-item" key={item.id}>
                  {item.image ? (
                    <img src={item.image} alt="" />
                  ) : (
                    <div className="my-item-placeholder">📦</div>
                  )}

                  <div className="my-item-info">
                    <span
                      className={`badge ${item.type?.toLowerCase()}`}
                    >
                      {item.type}
                    </span>

                    <h3>{item.title}</h3>
                    <p>
                      {item.location} • {item.date}
                    </p>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="content">
          <div className="section-title">
            <div>
              <span className="eyebrow">CLAIMS</span>
              <h2>My Claims</h2>
            </div>
          </div>

          {myClaims.length === 0 ? (
            <div className="empty-state">
              <div>📋</div>
              <h3>No claims submitted</h3>
              <p>Your claims will appear here.</p>
            </div>
          ) : (
            <div className="claims-grid">
              {myClaims.map((claim) => {
                const item = getItem(claim.itemId);

                return (
                  <div className="my-claim" key={claim.id}>
                    {item?.image && (
                      <img src={item.image} alt="" />
                    )}

                    <div>
                      <span
                        className={`status ${claim.status?.toLowerCase()}`}
                      >
                        {claim.status}
                      </span>

                      <h3>{item?.title || "Item"}</h3>

                      <p>
                        <strong>Proof:</strong> {claim.proof}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer>
        <strong>🔎 Digital Lost & Found</strong>
        <span>Helping students reconnect with their belongings.</span>
      </footer>

      {/* REPORT MODAL */}
      {showReport && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">NEW REPORT</span>
                <h2>Report an Item</h2>
                <p>Provide details about the lost or found item.</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowReport(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitReport}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Title</label>
                  <input
                    value={reportForm.title}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        title: e.target.value
                      })
                    }
                    placeholder="e.g. Black Wallet"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={reportForm.type}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        type: e.target.value
                      })
                    }
                  >
                    <option value="LOST">LOST</option>
                    <option value="FOUND">FOUND</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    value={reportForm.category}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        category: e.target.value
                      })
                    }
                    placeholder="e.g. Electronics"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={reportForm.date}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        date: e.target.value
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  value={reportForm.location}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      location: e.target.value
                    })
                  }
                  placeholder="Where was it lost/found?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      description: e.target.value
                    })
                  }
                  placeholder="Describe the item..."
                />
              </div>

              <div className="form-group">
                <label>Upload Item Image</label>

                {!reportForm.image ? (
                  <label className="upload-box">
                    <span>📷</span>
                    <strong>Click to upload image</strong>
                    <small>PNG, JPG or JPEG • Max 5MB</small>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                    />
                  </label>
                ) : (
                  <div className="preview">
                    <img src={reportForm.image} alt="Preview" />

                    <button
                      type="button"
                      onClick={() =>
                        setReportForm({
                          ...reportForm,
                          image: ""
                        })
                      }
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowReport(false)}
                >
                  Cancel
                </button>

                <button className="primary-btn">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLAIM MODAL */}
      {showClaim && (
        <div className="modal-overlay">
          <div className="modal small-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">CLAIM ITEM</span>
                <h2>{showClaim.title}</h2>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowClaim(null)}
              >
                ×
              </button>
            </div>

            <div className="claim-preview">
              {showClaim.image ? (
                <img src={showClaim.image} alt="" />
              ) : (
                <div>📦</div>
              )}

              <div>
                <strong>{showClaim.title}</strong>
                <span>{showClaim.location}</span>
              </div>
            </div>

            <form onSubmit={submitClaim}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  value={claimForm.claimantName}
                  onChange={(e) =>
                    setClaimForm({
                      ...claimForm,
                      claimantName: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  value={claimForm.claimantEmail}
                  onChange={(e) =>
                    setClaimForm({
                      ...claimForm,
                      claimantEmail: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Proof / Identification</label>
                <textarea
                  rows="5"
                  value={claimForm.proof}
                  onChange={(e) =>
                    setClaimForm({
                      ...claimForm,
                      proof: e.target.value
                    })
                  }
                  placeholder="Explain why this item belongs to you..."
                  required
                />
              </div>

              <div className="claim-note">
                Your claim will be reviewed by the administrator.
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowClaim(null)}
                >
                  Cancel
                </button>

                <button className="primary-btn">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && (
        <div className="modal-overlay">
          <div className="details-modal">
            <button
              className="close-btn details-close"
              onClick={() => setShowDetails(null)}
            >
              ×
            </button>

            <div className="details-image">
              {showDetails.image ? (
                <img src={showDetails.image} alt="" />
              ) : (
                "📦"
              )}
            </div>

            <div className="details-content">
              <span
                className={`badge ${showDetails.type?.toLowerCase()}`}
              >
                {showDetails.type}
              </span>

              <h2>{showDetails.title}</h2>

              <p>{showDetails.description}</p>

              <div className="details-list">
                <div>
                  <span>Category</span>
                  <strong>{showDetails.category}</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>{showDetails.location}</strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>{showDetails.date}</strong>
                </div>

                <div>
                  <span>Reported by</span>
                  <strong>
                    {user?.role === "ADMIN"
                      ? getReporterName(showDetails.reporterEmail)
                      : showDetails.reporterEmail}
                  </strong>
                </div>
              </div>

              {user?.role !== "ADMIN" &&
                showDetails.reporterEmail !== user?.email && (
                  <button
                    className="primary-btn full"
                    onClick={() => {
                      setShowDetails(null);
                      openClaim(showDetails);
                    }}
                  >
                    Claim This Item
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar({
  user,
  active,
  setPage,
  logout,
  notifications,
  setNotifications,
  pending
}) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-logo small">🔎</div>

        <div>
          <strong>Digital Lost & Found</strong>
          <small>Campus Recovery System</small>
        </div>
      </div>

      <nav>
        <button
          className={active === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        {user?.role === "ADMIN" && (
          <button
            className={active === "admin" ? "active" : ""}
            onClick={() => setPage("admin")}
          >
            Admin
          </button>
        )}
      </nav>

      <div className="nav-right">
        <div className="notification-wrap">
          <button
            className="icon-btn"
            onClick={() => setNotifications(!notifications)}
          >
            🔔
            {pending > 0 && (
              <span className="notification-count">{pending}</span>
            )}
          </button>

          {notifications && (
            <div className="notification-panel">
              <strong>Notifications</strong>

              {pending > 0 ? (
                <p>
                  You have {pending} pending claim
                  {pending > 1 ? "s" : ""}.
                </p>
              ) : (
                <p>No new notifications.</p>
              )}
            </div>
          )}
        </div>

        <div className="profile">
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AdminStat({ icon, title, value }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ItemCard({ item, user, onView, onClaim, onDelete }) {
  const isOwner =
    item.reporterEmail?.toLowerCase() === user?.email?.toLowerCase();

  return (
    <div className="item-card">
      <div className="item-image">
        {item.image ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <div>📦</div>
        )}

        <span className={`badge ${item.type?.toLowerCase()}`}>
          {item.type}
        </span>

        {isOwner && <span className="owner-badge">YOUR REPORT</span>}
      </div>

      <div className="item-body">
        <div className="item-heading">
          <h3>{item.title}</h3>
          <small>#{item.id}</small>
        </div>

        <p>{item.description || "No description provided."}</p>

        <div className="item-meta">
          <span>📍 {item.location}</span>
          <span>📅 {item.date}</span>
        </div>

        <div className="item-reporter">
          <div className="mini-avatar">
            {item.reporterEmail?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <small>Reported by</small>
            <strong>{item.reporterEmail}</strong>
          </div>
        </div>

        <div className="item-actions">
          <button className="view-btn" onClick={onView}>
            View
          </button>

          {!isOwner && (
            <button className="claim-btn" onClick={onClaim}>
              Claim
            </button>
          )}

          {isOwner && (
            <button className="manage-btn" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;