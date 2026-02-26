// ---------------------------------------------
// KLP DASHBOARD (UPDATED + CLEANED VERSION)
// ---------------------------------------------

let radarChartInstance = null;
let paradoxCharts = [];

// ---------------------------------------------
// MAIN ENTRY POINT
// ---------------------------------------------
window.addEventListener("load", () => {
    setTimeout(() => {
        initializeDashboard();
    }, 80);
});

// ---------------------------------------------
// INITIALIZE DASHBOARD
// ---------------------------------------------
function initializeDashboard() {
    const stored = localStorage.getItem("klp_result");
    if (!stored) {
        console.error("No stored assessment result found.");
        return;
    }

    const data = JSON.parse(stored);

    document.getElementById("archetype").innerText = data.archetype;

    buildParadoxSummary(data);
    buildLeadershipOverview(data);
    buildNarrativeSections(data);

    buildRadarChart(data);
    buildParadoxCharts(data);
}

// ---------------------------------------------
// PARADOX SUMMARY
// ---------------------------------------------
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

// ---------------------------------------------
// LEADERSHIP OVERVIEW
// ---------------------------------------------
function buildLeadershipOverview(data) {
    const deltas = data.scores;

    const avgDelta =
        (Math.abs(deltas.A) +
         Math.abs(deltas.B) +
         Math.abs(deltas.C) +
         Math.abs(deltas.D) +
         Math.abs(deltas.E)) / 5;

    let balanceLabel = "";
    if (avgDelta < 2) balanceLabel = "Highly Balanced Profile";
    else if (avgDelta < 4) balanceLabel = "Moderately Balanced Profile";
    else balanceLabel = "Strong Pole Preferences";

    document.getElementById("overview-archetype").innerText =
        `Archetype: ${data.archetype}`;

    document.getElementById("overview-balance").innerText =
        `Overall Balance: ${balanceLabel}`;

    document.getElementById("overview-strength").innerText =
        `Primary Leadership Strength: ${data.narrative.strengths}`;
}

// ---------------------------------------------
// NARRATIVE SECTIONS (Option B)
// ---------------------------------------------
function buildNarrativeSections(data) {
    const n = data.narrative;

    // 1. Strategic Orientation
    document.getElementById("narrative-strategy").innerText =
        `${n.strengths}\n\n${n.development_areas}\n\n${n.leadership_style_indicators}`;

    // 2. People & Culture Impact
    document.getElementById("narrative-people").innerText =
        `${n.team_impact}\n\n${n.communication_profile}`;

    // 3. Decision & Execution Style
    document.getElementById("narrative-decision").innerText =
        `${n.decision_making_profile}\n\n${n.growth_opportunities}`;

    // 4. Transformation Approach
    document.getElementById("narrative-transformation").innerText =
        `${n.development_areas}`;

    // 5. Leadership Growth Path
    document.getElementById("narrative-growth").innerText =
        `${n.growth_opportunities}`;
}

// ---------------------------------------------
// RADAR CHART
// ---------------------------------------------
function buildRadarChart(data) {
    const ctx = document.getElementById("radarChart");

    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels: [
                "Strategic Intent vs Tech Enthusiasm",
                "Enterprise Scale vs Local Innovation",
                "People & Culture vs Platforms & Architecture",
                "Automation Efficiency vs Service Redesign",
                "Innovation Speed vs Risk & Security"
            ],
            datasets: [{
                label: "Paradox Profile",
                data: [
                    data.scores.A,
                    data.scores.B,
                    data.scores.C,
                    data.scores.D,
                    data.scores.E
                ],
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: -10,
                    max: 10,
                    ticks: { stepSize: 2 }
                }
            },
            layout: { padding: 20 }
        }
    });
}

// ---------------------------------------------
// MINI PARADOX CHARTS
// ---------------------------------------------
function buildParadoxCharts(data) {
    paradoxCharts.forEach(chart => chart.destroy());
    paradoxCharts = [];

    const P = data.poles;
    const D = data.scores;

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-1",
        "Strategic Intent", "Tech Enthusiasm",
        P.SI_total, P.TE_total, D.A
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-2",
        "Enterprise Scale", "Local Innovation",
        P.ES_total, P.LI_total, D.B
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-3",
        "People & Culture", "Platforms & Architecture",
        P.PC_total, P.PA_total, D.C
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-4",
        "Automation Efficiency", "Service Redesign",
        P.AE_total, P.SR_total, D.D
    ));

    paradoxCharts.push(createParadoxChart(
        "chart-paradox-5",
        "Innovation Speed", "Risk & Security",
        P.IS_total, P.RT_total, D.E
    ));
}

// ---------------------------------------------
// CREATE A SINGLE PARADOX CHART
// ---------------------------------------------
function createParadoxChart(canvasId, pole1Label, pole2Label, pole1Score, pole2Score, delta) {
    const ctx = document.getElementById(canvasId);

    return new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                `${pole1Label} (${pole1Score}/20)`,
                `${pole2Label} (${pole2Score}/20)`,
                `Delta (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`
            ],
            datasets: [{
                data: [pole1Score, pole2Score, delta],
                backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"]
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    min: -10,
                    max: 20,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// ---------------------------------------------
// RE-RENDER CHARTS ON WINDOW RESIZE
// ---------------------------------------------
let resizeTimeout = null;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initializeDashboard();
    }, 200);
});
