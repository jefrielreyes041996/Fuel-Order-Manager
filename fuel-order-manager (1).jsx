import { useState } from "react";

const FUEL_TYPES = ["Unleaded", "Diesel", "Premium"];
const FUEL_COLORS = {
  Unleaded: { badge: "#EA580C", bar: "#F97316", light: "#FFEDD5" },
  Diesel:   { badge: "#1D4ED8", bar: "#3B82F6", light: "#DBEAFE" },
  Premium:  { badge: "#7C3AED", bar: "#8B5CF6", light: "#EDE9FE" },
};
const defaultPrices = { Unleaded: 58.50, Diesel: 55.75, Premium: 63.00 };
const defaultStations = [
  { id: 1, name: "Station 1", tanks: { Unleaded: { capacity: 20000, stock: 0 }, Diesel: { capacity: 20000, stock: 0 }, Premium: { capacity: 10000, stock: 0 } } },
  { id: 2, name: "Station 2", tanks: { Unleaded: { capacity: 20000, stock: 0 }, Diesel: { capacity: 20000, stock: 0 }, Premium: { capacity: 10000, stock: 0 } } },
  { id: 3, name: "Station 3", tanks: { Unleaded: { capacity: 20000, stock: 0 }, Diesel: { capacity: 20000, stock: 0 }, Premium: { capacity: 10000, stock: 0 } } },
];

function getTodayDate() { return new Date().toISOString().split("T")[0]; }
function generateOrderNo() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `ORD-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${String(Math.floor(Math.random()*900)+100)}`;
}
function fmt(x) { return Number(x).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtPeso(x) { return "₱" + Number(x).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDateDisplay(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

function StockBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = pct < 25 ? "#EF4444" : pct < 50 ? "#F59E0B" : "#22C55E";
  return (
    <div style={{ background: "#E5E7EB", borderRadius: 8, height: 8, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 8, transition: "width 0.4s" }} />
    </div>
  );
}

function FuelCard({ fuel, tank, price, onChange }) {
  const c = FUEL_COLORS[fuel];
  const orderNeeded = Math.max(0, tank.capacity - tank.stock);
  const pct = tank.capacity > 0 ? Math.min(100, (tank.stock / tank.capacity) * 100) : 0;
  const cost = orderNeeded * price;
  return (
    <div style={{ background: c.light, borderRadius: 12, padding: "14px 16px", flex: "1 1 160px", minWidth: 155, border: `1.5px solid ${c.badge}22` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: c.badge, letterSpacing: 0.5, textTransform: "uppercase" }}>{fuel}</span>
        <span style={{ fontSize: 11, color: "#6B7280", background: "#fff", borderRadius: 6, padding: "2px 7px", border: `1px solid ${c.badge}33` }}>{pct.toFixed(0)}% full</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 3 }}>Tank Capacity (L)</label>
        <input type="number" min="0" value={tank.capacity} onChange={e => onChange(fuel, "capacity", Number(e.target.value))}
          style={{ width: "100%", borderRadius: 7, border: "1.5px solid #D1D5DB", padding: "5px 9px", fontSize: 13, color: "#1F2937", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 3 }}>Stock on Hand (L)</label>
        <input type="number" min="0" max={tank.capacity} value={tank.stock} onChange={e => onChange(fuel, "stock", Number(e.target.value))}
          style={{ width: "100%", borderRadius: 7, border: `1.5px solid ${c.badge}55`, padding: "5px 9px", fontSize: 13, color: "#1F2937", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }} />
      </div>
      <StockBar value={tank.stock} max={tank.capacity} />
      <div style={{ marginTop: 10, background: orderNeeded > 0 ? "#FEF2F2" : "#F0FDF4", borderRadius: 8, padding: "6px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#6B7280" }}>To Order</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: orderNeeded > 0 ? "#DC2626" : "#16A34A" }}>{fmt(orderNeeded)} L</span>
        </div>
        {orderNeeded > 0 && price > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, borderTop: `1px dashed ${c.badge}33`, paddingTop: 4 }}>
            <span style={{ fontSize: 11, color: "#6B7280" }}>Est. Cost</span>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#7C3AED" }}>{fmtPeso(cost)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PDF PRINT COMPONENT ─────────────────────────────────────────────────────
function PrintablePDF({ stations, prices, totals, grandOrder, grandCost, orderNo, orderDate, onClose }) {
  const FUEL_TYPES = ["Unleaded", "Diesel", "Premium"];
  const FUEL_COLORS_PRINT = { Unleaded: "#EA580C", Diesel: "#1D4ED8", Premium: "#7C3AED" };

  const handlePrint = () => window.print();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "20px 0" }}>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #printable-area { display: block !important; position: fixed; inset: 0; background: white; }
          .no-print { display: none !important; }
        }
        #printable-area { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
      `}</style>

      <div style={{ background: "#fff", width: "100%", maxWidth: 820, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}>
        {/* Modal Toolbar */}
        <div className="no-print" style={{ background: "#1E3A5F", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>🖨️ Print Preview — {orderNo}</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handlePrint} style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🖨️ Print / Save PDF</button>
            <button onClick={onClose} style={{ background: "#ffffff22", color: "#fff", border: "1px solid #ffffff44", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✕ Close</button>
          </div>
        </div>

        {/* Printable Content */}
        <div id="printable-area" style={{ padding: "32px 36px", background: "#fff" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "3px solid #1E3A5F", paddingBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 28 }}>⛽</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: "#1E3A5F" }}>FuelOrder Manager</span>
              </div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>Fuel Delivery Order Summary</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1E3A5F" }}>{orderNo}</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Order Date: <b style={{ color: "#1F2937" }}>{fmtDateDisplay(orderDate)}</b></div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Printed: {new Date().toLocaleString("en-PH")}</div>
            </div>
          </div>

          {/* Fuel Price Reference */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {FUEL_TYPES.map(f => (
              <div key={f} style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: FUEL_COLORS_PRINT[f] }}>{f}</span>
                <span style={{ fontSize: 13, color: "#1F2937", fontWeight: 600 }}>@ {fmtPeso(prices[f])} / L</span>
              </div>
            ))}
          </div>

          {/* Per-Station Table */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#1E3A5F", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Per-Station Order Breakdown</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#1E3A5F", color: "#fff" }}>
                  <th style={{ textAlign: "left", padding: "9px 12px", fontWeight: 700 }}>Station</th>
                  {FUEL_TYPES.map(f => (
                    <th key={f} colSpan={2} style={{ textAlign: "center", padding: "9px 8px", fontWeight: 700, borderLeft: "1px solid #ffffff22" }}>{f}</th>
                  ))}
                  <th colSpan={2} style={{ textAlign: "center", padding: "9px 8px", fontWeight: 700, borderLeft: "2px solid #ffffff44" }}>TOTAL</th>
                </tr>
                <tr style={{ background: "#E8EDF3" }}>
                  <th style={{ padding: "5px 12px" }}></th>
                  {FUEL_TYPES.map(f => (
                    <>
                      <th key={f+"l"} style={{ textAlign: "center", padding: "5px 6px", fontSize: 10, color: "#475569", fontWeight: 600, borderLeft: "1px solid #D1D5DB" }}>Liters</th>
                      <th key={f+"p"} style={{ textAlign: "center", padding: "5px 6px", fontSize: 10, color: "#475569", fontWeight: 600 }}>Amount</th>
                    </>
                  ))}
                  <th style={{ textAlign: "center", padding: "5px 6px", fontSize: 10, color: "#475569", fontWeight: 600, borderLeft: "2px solid #CBD5E1" }}>Liters</th>
                  <th style={{ textAlign: "center", padding: "5px 6px", fontSize: 10, color: "#475569", fontWeight: 600 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s, i) => {
                  const stL = FUEL_TYPES.reduce((sum, f) => sum + Math.max(0, (s.tanks[f]?.capacity||0)-(s.tanks[f]?.stock||0)), 0);
                  const stP = FUEL_TYPES.reduce((sum, f) => { const o = Math.max(0,(s.tanks[f]?.capacity||0)-(s.tanks[f]?.stock||0)); return sum + o*(prices[f]||0); }, 0);
                  return (
                    <tr key={s.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1E3A5F", borderBottom: "1px solid #E5E7EB" }}>{s.name}</td>
                      {FUEL_TYPES.map(f => {
                        const ord = Math.max(0, (s.tanks[f]?.capacity||0)-(s.tanks[f]?.stock||0));
                        const cost = ord * (prices[f]||0);
                        return (
                          <>
                            <td key={f+"l"} style={{ textAlign: "center", padding: "8px 6px", borderBottom: "1px solid #E5E7EB", borderLeft: "1px solid #E5E7EB", color: ord > 0 ? "#DC2626" : "#9CA3AF", fontWeight: ord > 0 ? 700 : 400 }}>
                              {ord > 0 ? `${fmt(ord)} L` : "—"}
                            </td>
                            <td key={f+"p"} style={{ textAlign: "center", padding: "8px 6px", borderBottom: "1px solid #E5E7EB", color: ord > 0 ? "#7C3AED" : "#9CA3AF", fontWeight: ord > 0 ? 700 : 400 }}>
                              {ord > 0 ? fmtPeso(cost) : "—"}
                            </td>
                          </>
                        );
                      })}
                      <td style={{ textAlign: "center", padding: "8px 6px", fontWeight: 800, color: stL > 0 ? "#1E3A5F" : "#16A34A", borderBottom: "1px solid #E5E7EB", borderLeft: "2px solid #CBD5E1" }}>
                        {stL > 0 ? `${fmt(stL)} L` : "✓"}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px 6px", fontWeight: 800, color: stP > 0 ? "#7C3AED" : "#16A34A", borderBottom: "1px solid #E5E7EB" }}>
                        {stP > 0 ? fmtPeso(stP) : "✓"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#1E3A5F", color: "#fff" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 800 }}>GRAND TOTAL</td>
                  {FUEL_TYPES.map(f => (
                    <>
                      <td key={f+"l"} style={{ textAlign: "center", padding: "9px 6px", fontWeight: 800, borderLeft: "1px solid #ffffff22" }}>{fmt(totals[f].totalOrder)} L</td>
                      <td key={f+"p"} style={{ textAlign: "center", padding: "9px 6px", fontWeight: 800 }}>{fmtPeso(totals[f].totalCost)}</td>
                    </>
                  ))}
                  <td style={{ textAlign: "center", padding: "9px 6px", fontWeight: 900, borderLeft: "2px solid #ffffff44" }}>{fmt(grandOrder)} L</td>
                  <td style={{ textAlign: "center", padding: "9px 6px", fontWeight: 900 }}>{fmtPeso(grandCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Grand Total Box */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ flex: 1, background: "#EFF6FF", border: "2px solid #1D4ED8", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Total Liters to Order</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#1D4ED8" }}>{fmt(grandOrder)} L</div>
            </div>
            <div style={{ flex: 1, background: "#F5F3FF", border: "2px solid #7C3AED", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Total Check Amount</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#7C3AED" }}>{fmtPeso(grandCost)}</div>
            </div>
          </div>

          {/* Signature Block */}
          <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
            {["Prepared by", "Checked by", "Approved by"].map(label => (
              <div key={label} style={{ flex: 1, borderTop: "2px solid #1E3A5F", paddingTop: 8 }}>
                <div style={{ fontSize: 11, color: "#6B7280", textAlign: "center" }}>{label}</div>
                <div style={{ height: 36 }}></div>
                <div style={{ borderTop: "1px solid #9CA3AF", marginTop: 4, paddingTop: 4, fontSize: 10, color: "#9CA3AF", textAlign: "center" }}>Signature over Printed Name</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────────────────
export default function FuelOrderManager() {
  const [stations, setStations] = useState(defaultStations);
  const [prices, setPrices] = useState(defaultPrices);
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState("stations");
  const [expandedId, setExpandedId] = useState(null);
  const [orderNo, setOrderNo] = useState(generateOrderNo());
  const [orderDate, setOrderDate] = useState(getTodayDate());
  const [showPrint, setShowPrint] = useState(false);

  function updateTank(stationId, fuel, field, val) {
    setStations(prev => prev.map(s =>
      s.id !== stationId ? s : { ...s, tanks: { ...s.tanks, [fuel]: { ...s.tanks[fuel], [field]: val } } }
    ));
  }
  function addStation() {
    if (!newName.trim()) return;
    const id = Date.now();
    setStations(prev => [...prev, { id, name: newName.trim(), tanks: { Unleaded: { capacity: 20000, stock: 0 }, Diesel: { capacity: 20000, stock: 0 }, Premium: { capacity: 10000, stock: 0 } } }]);
    setNewName(""); setExpandedId(id);
  }
  function removeStation(id) { setStations(prev => prev.filter(s => s.id !== id)); }

  const totals = FUEL_TYPES.reduce((acc, fuel) => {
    const totalCap = stations.reduce((s, st) => s + (st.tanks[fuel]?.capacity || 0), 0);
    const totalStock = stations.reduce((s, st) => s + (st.tanks[fuel]?.stock || 0), 0);
    const totalOrder = stations.reduce((s, st) => { const t = st.tanks[fuel]; return s + Math.max(0, (t?.capacity||0)-(t?.stock||0)); }, 0);
    const totalCost = totalOrder * (prices[fuel] || 0);
    acc[fuel] = { totalCap, totalStock, totalOrder, totalCost };
    return acc;
  }, {});

  const grandOrder = FUEL_TYPES.reduce((s, f) => s + totals[f].totalOrder, 0);
  const grandCost = FUEL_TYPES.reduce((s, f) => s + totals[f].totalCost, 0);
  const tabStyle = (tab) => ({
    padding: "12px 22px", fontWeight: 700, fontSize: 13, border: "none", background: "none", cursor: "pointer",
    color: activeTab === tab ? "#1E3A5F" : "#6B7280",
    borderBottom: activeTab === tab ? "3px solid #F97316" : "3px solid transparent",
    transition: "all 0.2s", letterSpacing: 0.3
  });

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1F2937" }}>

      {showPrint && (
        <PrintablePDF stations={stations} prices={prices} totals={totals}
          grandOrder={grandOrder} grandCost={grandCost}
          orderNo={orderNo} orderDate={orderDate} onClose={() => setShowPrint(false)} />
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #0F2744 100%)", padding: "18px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 40, height: 40, background: "#F97316", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⛽</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>FuelOrder Manager</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{stations.length} station{stations.length !== 1 ? "s" : ""} · Unleaded, Diesel & Premium</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ background: "#1D4ED8", color: "#fff", borderRadius: 10, padding: "7px 16px", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>TOTAL LITERS</div>
            <div>{fmt(grandOrder)} L</div>
          </div>
          <div style={{ background: "#16A34A", color: "#fff", borderRadius: 10, padding: "7px 16px", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>TOTAL CHECK AMOUNT</div>
            <div>{fmtPeso(grandCost)}</div>
          </div>
          <button onClick={() => setShowPrint(true)}
            style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            🖨️ Export PDF
          </button>
        </div>
      </div>

      {/* Order Info Bar */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #E5E7EB", padding: "10px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4 }}>📋 Order No.</span>
          <input value={orderNo} onChange={e => setOrderNo(e.target.value)}
            style={{ border: "1.5px solid #D1D5DB", borderRadius: 7, padding: "5px 10px", fontSize: 13, fontWeight: 700, color: "#1E3A5F", outline: "none", fontFamily: "inherit", width: 200 }} />
          <button onClick={() => setOrderNo(generateOrderNo())}
            style={{ background: "#F1F5F9", border: "1px solid #D1D5DB", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#6B7280", cursor: "pointer", fontWeight: 600 }}>↻ New</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4 }}>📅 Order Date</span>
          <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)}
            style={{ border: "1.5px solid #D1D5DB", borderRadius: 7, padding: "5px 10px", fontSize: 13, color: "#1F2937", outline: "none", fontFamily: "inherit" }} />
        </div>
      </div>

      {/* Price Settings Bar */}
      <div style={{ background: "#1E3A5F10", borderBottom: "1.5px solid #E5E7EB", padding: "10px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>⚙️ Price per Liter (₱)</span>
        {FUEL_TYPES.map(fuel => {
          const c = FUEL_COLORS[fuel];
          return (
            <div key={fuel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.badge }}>{fuel}</span>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#6B7280", pointerEvents: "none" }}>₱</span>
                <input type="number" min="0" step="0.01" value={prices[fuel]}
                  onChange={e => setPrices(p => ({ ...p, [fuel]: parseFloat(e.target.value) || 0 }))}
                  style={{ width: 90, borderRadius: 7, border: `1.5px solid ${c.badge}55`, padding: "5px 8px 5px 20px", fontSize: 13, color: "#1F2937", outline: "none", fontFamily: "inherit", background: c.light }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #E5E7EB", background: "#fff", paddingLeft: 20 }}>
        <button style={tabStyle("stations")} onClick={() => setActiveTab("stations")}>🏪 Stations</button>
        <button style={tabStyle("summary")} onClick={() => setActiveTab("summary")}>📊 Order Summary</button>
      </div>

      <div style={{ padding: "22px 20px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── STATIONS TAB ── */}
        {activeTab === "stations" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addStation()}
                placeholder="New station name (e.g. Station 11 - Taytay)"
                style={{ flex: 1, border: "1.5px solid #D1D5DB", borderRadius: 9, padding: "9px 14px", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              <button onClick={addStation} style={{ background: "#1E3A5F", color: "#fff", border: "none", borderRadius: 9, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Add Station</button>
            </div>

            {stations.map(station => {
              const isExpanded = expandedId === station.id;
              const stationOrder = FUEL_TYPES.reduce((s, f) => { const t = station.tanks[f]; return s + Math.max(0, (t?.capacity||0)-(t?.stock||0)); }, 0);
              const stationCost = FUEL_TYPES.reduce((s, f) => { const ord = Math.max(0,(station.tanks[f]?.capacity||0)-(station.tanks[f]?.stock||0)); return s + ord*(prices[f]||0); }, 0);
              return (
                <div key={station.id} style={{ background: "#fff", borderRadius: 14, marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1.5px solid #E5E7EB", overflow: "hidden" }}>
                  <div onClick={() => setExpandedId(isExpanded ? null : station.id)}
                    style={{ display: "flex", alignItems: "center", padding: "14px 20px", cursor: "pointer", gap: 10, background: isExpanded ? "#F1F5F9" : "#fff", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 18 }}>⛽</span>
                    <span style={{ fontWeight: 700, fontSize: 15, flex: 1, color: "#1E3A5F", minWidth: 120 }}>{station.name}</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {FUEL_TYPES.map(f => { const ord = Math.max(0,(station.tanks[f]?.capacity||0)-(station.tanks[f]?.stock||0)); return ord > 0 ? <span key={f} style={{ fontSize: 11, background: FUEL_COLORS[f].light, color: FUEL_COLORS[f].badge, borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{f[0]}: {fmt(ord)}L</span> : null; })}
                    </div>
                    {stationOrder > 0 && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 12, color: "#DC2626", background: "#FEF2F2", borderRadius: 7, padding: "3px 10px" }}>{fmt(stationOrder)} L</span>
                        <span style={{ fontWeight: 800, fontSize: 12, color: "#7C3AED", background: "#F5F3FF", borderRadius: 7, padding: "3px 10px" }}>{fmtPeso(stationCost)}</span>
                      </div>
                    )}
                    {stationOrder === 0 && <span style={{ fontWeight: 700, fontSize: 12, color: "#16A34A", background: "#F0FDF4", borderRadius: 7, padding: "3px 11px" }}>✓ Full</span>}
                    <span style={{ color: "#94A3B8", fontSize: 16 }}>{isExpanded ? "▲" : "▼"}</span>
                    <button onClick={e => { e.stopPropagation(); removeStation(station.id); }} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✕</button>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: "14px 20px 18px", display: "flex", gap: 14, flexWrap: "wrap", borderTop: "1.5px solid #E5E7EB" }}>
                      {FUEL_TYPES.map(fuel => (
                        <FuelCard key={fuel} fuel={fuel} tank={station.tanks[fuel]} price={prices[fuel]}
                          onChange={(f, field, val) => updateTank(station.id, f, field, val)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── SUMMARY TAB ── */}
        {activeTab === "summary" && (
          <>
            {/* Order Info Summary */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <div><span style={{ fontSize: 11, color: "#6B7280" }}>Order No.</span><div style={{ fontWeight: 800, fontSize: 15, color: "#1E3A5F" }}>{orderNo}</div></div>
              <div><span style={{ fontSize: 11, color: "#6B7280" }}>Order Date</span><div style={{ fontWeight: 700, fontSize: 15, color: "#1F2937" }}>{fmtDateDisplay(orderDate)}</div></div>
              <div><span style={{ fontSize: 11, color: "#6B7280" }}>Stations</span><div style={{ fontWeight: 700, fontSize: 15, color: "#1F2937" }}>{stations.length}</div></div>
              <button onClick={() => setShowPrint(true)}
                style={{ marginLeft: "auto", background: "#1E3A5F", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                🖨️ Export & Print PDF
              </button>
            </div>

            {/* Per-fuel cards */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              {FUEL_TYPES.map(fuel => {
                const { totalCap, totalStock, totalOrder, totalCost } = totals[fuel];
                const c = FUEL_COLORS[fuel];
                const pct = totalCap > 0 ? ((totalStock / totalCap) * 100).toFixed(1) : 0;
                return (
                  <div key={fuel} style={{ flex: "1 1 200px", background: "#fff", borderRadius: 14, padding: "18px 20px", border: `2px solid ${c.badge}33`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: c.badge, textTransform: "uppercase", letterSpacing: 0.5 }}>{fuel}</span>
                      <span style={{ fontSize: 11, color: "#6B7280", background: c.light, borderRadius: 6, padding: "2px 9px" }}>{pct}% avg</span>
                    </div>
                    <StockBar value={totalStock} max={totalCap} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280", marginTop: 8, marginBottom: 12 }}>
                      <span>Stock: <b style={{ color: "#1F2937" }}>{fmt(totalStock)} L</b></span>
                      <span>Cap: <b style={{ color: "#1F2937" }}>{fmt(totalCap)} L</b></span>
                    </div>
                    <div style={{ background: totalOrder > 0 ? "#FEF2F2" : "#F0FDF4", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Total to Order</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: totalOrder > 0 ? "#DC2626" : "#16A34A" }}>{fmt(totalOrder)} L</div>
                    </div>
                    <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Est. Check Amount <span style={{ color: c.badge }}>@ ₱{prices[fuel]}/L</span></div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#7C3AED" }}>{fmtPeso(totalCost)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grand Total Banner */}
            <div style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #0F2744 100%)", borderRadius: 16, padding: "20px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>Grand Total — All Fuel Types</div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 2 }}>{fmt(grandOrder)} Liters</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>Total Check to Issue</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#4ADE80", marginTop: 2 }}>{fmtPeso(grandCost)}</div>
              </div>
              <div style={{ fontSize: 36 }}>🛢️</div>
            </div>

            {/* Per-station table */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1.5px solid #E5E7EB", fontWeight: 700, fontSize: 14, color: "#1E3A5F" }}>📋 Per-Station Order & Cost Breakdown</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      <th style={{ textAlign: "left", padding: "10px 16px", color: "#6B7280", fontWeight: 700, borderBottom: "1px solid #E5E7EB" }}>Station</th>
                      {FUEL_TYPES.map(f => <th key={f} colSpan={2} style={{ textAlign: "center", padding: "10px 8px", color: FUEL_COLORS[f].badge, fontWeight: 700, borderBottom: "1px solid #E5E7EB", borderLeft: "1px solid #F1F5F9" }}>{f}</th>)}
                      <th colSpan={2} style={{ textAlign: "center", padding: "10px 8px", color: "#1E3A5F", fontWeight: 700, borderBottom: "1px solid #E5E7EB", borderLeft: "1px solid #E5E7EB" }}>Total</th>
                    </tr>
                    <tr style={{ background: "#F8FAFC" }}>
                      <th style={{ padding: "6px 16px", borderBottom: "1.5px solid #E5E7EB" }}></th>
                      {FUEL_TYPES.map(f => (<>
                        <th key={f+"L"} style={{ textAlign: "center", padding: "6px 8px", fontSize: 11, color: "#6B7280", fontWeight: 600, borderBottom: "1.5px solid #E5E7EB", borderLeft: "1px solid #F1F5F9" }}>Liters</th>
                        <th key={f+"P"} style={{ textAlign: "center", padding: "6px 8px", fontSize: 11, color: "#6B7280", fontWeight: 600, borderBottom: "1.5px solid #E5E7EB" }}>Amount</th>
                      </>))}
                      <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 11, color: "#6B7280", fontWeight: 600, borderBottom: "1.5px solid #E5E7EB", borderLeft: "1px solid #E5E7EB" }}>Liters</th>
                      <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 11, color: "#6B7280", fontWeight: 600, borderBottom: "1.5px solid #E5E7EB" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((s, i) => {
                      const stTotalL = FUEL_TYPES.reduce((sum, f) => sum + Math.max(0,(s.tanks[f]?.capacity||0)-(s.tanks[f]?.stock||0)), 0);
                      const stTotalP = FUEL_TYPES.reduce((sum, f) => { const ord = Math.max(0,(s.tanks[f]?.capacity||0)-(s.tanks[f]?.stock||0)); return sum + ord*(prices[f]||0); }, 0);
                      return (
                        <tr key={s.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                          <td style={{ padding: "10px 16px", fontWeight: 600, color: "#1E3A5F", borderBottom: "1px solid #F1F5F9" }}>{s.name}</td>
                          {FUEL_TYPES.map(f => { const ord = Math.max(0,(s.tanks[f]?.capacity||0)-(s.tanks[f]?.stock||0)); const cost = ord*(prices[f]||0); return (<>
                            <td key={f+"L"} style={{ textAlign: "center", padding: "10px 8px", borderBottom: "1px solid #F1F5F9", borderLeft: "1px solid #F1F5F9", fontWeight: ord>0?700:400, color: ord>0?"#DC2626":"#9CA3AF" }}>{ord>0?`${fmt(ord)} L`:"—"}</td>
                            <td key={f+"P"} style={{ textAlign: "center", padding: "10px 8px", borderBottom: "1px solid #F1F5F9", fontWeight: ord>0?700:400, color: ord>0?"#7C3AED":"#9CA3AF" }}>{ord>0?fmtPeso(cost):"—"}</td>
                          </>); })}
                          <td style={{ textAlign: "center", padding: "10px 8px", fontWeight: 800, color: stTotalL>0?"#1E3A5F":"#16A34A", borderBottom: "1px solid #F1F5F9", borderLeft: "1px solid #E5E7EB" }}>{stTotalL>0?`${fmt(stTotalL)} L`:"✓"}</td>
                          <td style={{ textAlign: "center", padding: "10px 8px", fontWeight: 800, color: stTotalP>0?"#7C3AED":"#16A34A", borderBottom: "1px solid #F1F5F9" }}>{stTotalP>0?fmtPeso(stTotalP):"✓"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#F1F5F9" }}>
                      <td style={{ padding: "10px 16px", fontWeight: 800, color: "#1E3A5F" }}>TOTAL</td>
                      {FUEL_TYPES.map(f => (<>
                        <td key={f+"L"} style={{ textAlign: "center", padding: "10px 8px", fontWeight: 800, color: FUEL_COLORS[f].badge, borderLeft: "1px solid #E5E7EB" }}>{fmt(totals[f].totalOrder)} L</td>
                        <td key={f+"P"} style={{ textAlign: "center", padding: "10px 8px", fontWeight: 800, color: "#7C3AED" }}>{fmtPeso(totals[f].totalCost)}</td>
                      </>))}
                      <td style={{ textAlign: "center", padding: "10px 8px", fontWeight: 900, color: "#1E3A5F", borderLeft: "1px solid #E5E7EB" }}>{fmt(grandOrder)} L</td>
                      <td style={{ textAlign: "center", padding: "10px 8px", fontWeight: 900, color: "#7C3AED" }}>{fmtPeso(grandCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
