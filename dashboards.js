// ----------------------------------------------------
// KLP DASHBOARD — FINAL MIRRORED DIFFERENCE CHART
// ----------------------------------------------------

let paradoxSummaryChartInstance = null;
let paradoxCharts = [];

// ----------------------------------------------------
// MAIN ENTRY
// ----------------------------------------------------
window.addEventListener("load", () => {
    setTimeout(() => initializeDashboard(), 80);
});

// ----------------------------------------------------
// INITIALIZE
// ----------------------------------------------------
function initializeDashboard() {
    const stored = localStorage.getItem("klp_result");
    if (!stored) return console.error("No stored assessment result found.");

    const data = JSON.parse(stored);

    document.getElementById("archetype").innerText = data.archetype;

    buildParadoxSummary(data);
    buildLeadershipOverview(data);
    buildNarrativeSections(data);

    buildMirroredParadoxSummaryChart(data);
    buildParadoxCharts(data);
}

// ----------------------------------------------------
// PARADOX SUMMARY TEXT
// ----------------------------------------------------
function buildParadoxSummary(data) {
    const deltas = data.scores;

    const paradoxNames = {
        A: "Strategic Intent vs Technology Enthusiasm",
        B: "Enterprise Scale vs Local Innovation",
        C: "People & Culture vs Platforms & Architecture",
        D: "Automation Efficiency vs Service Redesign",
        E: "Innovation Speed vs Risk, Security & Trust"
    };

    const sorted = Object.entries(deltas).sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));
    const mostAligned = sorted[0][0];
    const mostStretched = sorted[sorted.length - 1][0];

    document.getElementById("summary-most-aligned").innerText =
        `Most aligned paradox: ${paradoxNames[mostAligned]}`;

    document.getElementById("summary-most-stretched").innerText =
        `Most stretched paradox: ${paradoxNames[mostStretched]}`;

    document.getElementById("summary-overall").innerText =
        `Overall balance score: ${data.archetype}`;

    document.getElementById("summary-interpretation").innerText =
        data.narrative.summary;
}

// ----------------------------------------------------
// LEADERSHIP OVERVIEW TEXT
// ----------------------------------------------------
function buildLeadershipOverview(data) {
    const d = data.scores;
    const avg = (Math.abs(d.A) + Math.abs(d.B) + Math.abs(d.C) + Math.abs(d.D) + Math.abs(d.E)) / 5;

    let label = "";
    if (avg < 2) label = "Highly Balanced Profile";
    else if (avg < 4) label = "Moderately Balanced Profile";
    else label = "Strong Pole Preferences";

    document.getElementById("overview-archetype").innerText = `Archetype: ${data.archetype}`;
    document.getElementById("overview-balance").innerText = `Overall Balance: ${label}`;
    document.getElementById("overview-strength").innerText = `Primary Leadership Strength: ${data.narrative.strengths}`;
}

// ----------------------------------------------------
// NARRATIVE SECTIONS
// ----------------------------------------------------
function buildNarrativeSections(data) {
    const n = data.narrative;

    document.getElementById("narrative-strategy").innerText =
        `${n.strengths}\n\n${n.development_areas}\n\n${n.leadership_style_indicators}`;

    document.getElementById("narrative-people").innerText =
        `${n.team_impact}\n\n${n.communication_profile}`;

    document.getElementById("narrative-decision").innerText =
        `${n.decision_making_profile}\n\n${n.growth_opportunities}`;

    document.getElementById("narrative-transformation").innerText =
        `${n.development_areas}`;

    document.getElementById("narrative-growth").innerText =
        `${n.growth_opportunities}`;
}

// ----------------------------------------------------
// FINAL MIRRORED PARADOX SUMMARY CHART
// ----------------------------------------------------
function buildMirroredParadoxSummaryChart(data) {
    const ctx = document.getElementById("radarChart");
    if (!ctx) return;

    if (paradoxSummaryChartInstance) paradoxSummaryChartInstance.destroy();

    const P = data.poles;
    const D = data.scores;

    const labels = [
        "Strategic Intent vs Technology Enthusiasm",
        "Enterprise Scale vs Local Innovation",
        "People & Culture vs Platforms & Architecture",
        "Automation Efficiency vs Service Redesign",
        "Innovation Speed vs Risk, Security & Trust"
    ];

    const pole1Labels = [
        `Strategic Intent (${P.SI_total})`,
        `Enterprise Scale (${P.ES_total})`,
        `People & Culture (${P.PC_total})`,
        `Automation Efficiency (${P.AE_total})`,
        `Innovation Speed (${P.IS_total})`
    ];

    const pole2Labels = [
        `(${P.TE_total}) Technology Enthusiasm`,
        `(${P.LI_total}) Local Innovation`,
        `(${P.PA_total}) Platforms & Architecture`,
        `(${P.SR_total}) Service Redesign`,
        `(${P.RT_total}) Risk, Security & Trust`
    ];

    const diffs = [D.A, D.B, D.C, D.D, D.E];

    // Plugin to draw pole labels + scores outside chart area
    const externalLabelsPlugin = {
        id: "externalLabels",
        afterDraw(chart) {
            const { ctx, chartArea } = chart;
            ctx.save();
            ctx.font = "14px Arial";
            ctx.textBaseline = "middle";

            const meta = chart.getDatasetMeta(0);

            meta.data.forEach((bar, i) => {
                const y = bar.y;

                // LEFT LABEL
                ctx.textAlign = "right";
                ctx.fillStyle = "#222";
                ctx.fillText(pole1Labels[i], chartArea.left - 12, y);

                // RIGHT LABEL
                ctx.textAlign = "left";
                ctx.fillText(pole2Labels[i], chartArea.right + 12, y);
            });

            ctx.restore();
        }
    };

    // Plugin to draw signed difference inside bar
    const diffLabelPlugin = {
        id: "diffLabels",
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);

            ctx.save();
            ctx.font = "13px Arial";
            ctx.textBaseline = "middle";

            meta.data.forEach((bar, i) => {
                const diff = diffs[i];
                const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
                const absVal = Math.abs(diff);
                const label = `${sign}${absVal}`;

                const barStart = bar.base;
                const barEnd = bar.x;
                const barWidth = Math.abs(barEnd - barStart);

                const textWidth = ctx.measureText(label).width + 10;

                let x;
                let inside = barWidth > textWidth;

                if (inside) {
                    ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    x = barStart + (barEnd - barStart) / 2;
                } else {
                    ctx.fillStyle = "#222";
                    ctx.textAlign = diff > 0 ? "left" : "right";
                    x = diff > 0 ? barEnd + 6 : barEnd - 6;
                }

                ctx.fillText(label, x, bar.y);
            });

            ctx.restore();
        }
    };

    paradoxSummaryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                data: diffs,
                backgroundColor: diffs.map(v => v > 0 ? "#4CAF50" : "#FF9800"),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { left: 140, right: 140 } },
            scales: {
                x: {
                    min: -10,
                    max: 10,
                    grid: { color: "#ddd" },
                    ticks: { stepSize: 2, color: "#333" }
                },
                y: {
                    ticks: { display: false },
                    grid: { display: false }
                }
            },
            plugins: { legend: { display: false } }
        },
        plugins: [externalLabelsPlugin, diffLabelPlugin]
    });
}

// ----------------------------------------------------
// MINI PARADOX CHARTS (unchanged)
// ----------------------------------------------------
function buildParadoxCharts(data) {
    paradoxCharts.forEach(c => c.destroy());
    paradoxCharts = [];

    const P = data.poles;
    const D = data.scores;

    paradoxCharts.push(createParadoxChart("chart-paradox-1", "Strategic Intent", "Tech Enthusiasm", P.SI_total, P.TE_total, D.A));
    paradoxCharts.push(createParadoxChart("chart-paradox-2", "Enterprise Scale", "Local Innovation", P.ES_total, P.LI_total, D.B));
    paradoxCharts.push(createParadoxChart("chart-paradox-3", "People & Culture", "Platforms & Architecture", P.PC_total, P.PA_total, D.C));
    paradoxCharts.push(createParadoxChart("chart-paradox-4", "Automation Efficiency", "Service Redesign", P.AE_total, P.SR_total, D.D));
    paradoxCharts.push(createParadoxChart("chart-paradox-5", "Innovation Speed", "Risk & Security", P.IS_total, P.RT_total, D.E));
}

function createParadoxChart(id, p1, p2, s1, s2, delta) {
    const ctx = document.getElementById(id);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: "bar",
        data: {
            labels: [`${p1} (${s1})`, `${p2} (${s2})`, `Delta (${delta >= 0 ? "+" : ""}${delta})`],
            datasets: [{
                data: [s1, s2, delta],
                backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { min: -10, max: 20, ticks: { stepSize: 5 } },
                y: { ticks: { color: "#333" } }
            }
        }
    });
}

// ----------------------------------------------------
// RESIZE HANDLER
// ----------------------------------------------------
let resizeTimeout = null;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => initializeDashboard(), 200);
});
